import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createHash } from 'node:crypto';

const tagOf = node => Object.keys(node).find(k => k !== ':@');
const nodesNamed = (nodes, name) => {
  const matches = [];
  for (const node of nodes ?? []) {
    const tag = tagOf(node);
    if (tag === name) matches.push(node);
    if (Array.isArray(node[tag])) matches.push(...nodesNamed(node[tag], name));
  }
  return matches;
};
const textOf = nodes => (nodes ?? []).map(node => {
  const tag = tagOf(node);
  if (tag === '#text') return String(node[tag]);
  return Array.isArray(node[tag]) ? textOf(node[tag]) : '';
}).join('');
const clean = value => value.replace(/\s+/g, ' ').trim();

export function extractArticle(xml, { verifiedLicenseUrl } = {}) {
  if (XMLValidator.validate(xml) !== true) throw new Error('Invalid source XML');
  const parsed = new XMLParser({ preserveOrder: true, ignoreAttributes: false,
    attributeNamePrefix: '@', trimValues: false, processEntities: true }).parse(xml);
  const front = nodesNamed(parsed, 'front')[0]?.front ?? [];
  const meta = nodesNamed(front, 'article-meta')[0]?.['article-meta'] ?? [];
  const title = clean(textOf(nodesNamed(meta, 'article-title')[0]?.['article-title']));
  const authors = nodesNamed(meta, 'contrib').filter(node => [undefined, 'author'].includes(node[':@']?.['@contrib-type'])).map(node => {
    const name = nodesNamed(node.contrib, 'name')[0]?.name ?? [];
    return clean([textOf(nodesNamed(name, 'given-names')[0]?.['given-names']), textOf(nodesNamed(name, 'surname')[0]?.surname)].join(' ')) ||
      clean(textOf(nodesNamed(node.contrib, 'collab')[0]?.collab));
  }).filter(Boolean);
  const ids = nodesNamed(meta, 'article-id');
  const id = type => clean(textOf(ids.find(node => node[':@']?.['@pub-id-type'] === type)?.['article-id']));
  const licenseUrls = nodesNamed(meta, 'license').flatMap(node => [node[':@']?.['@xlink:href'],
    ...nodesNamed(node.license, 'ext-link').map(link => link[':@']?.['@xlink:href'])]);
  const validLicense = url => /^https?:\/\/creativecommons\.org\/licenses\/by\/(3\.0|4\.0)\/?$/.test(url ?? '');
  const licenseText = clean(nodesNamed(meta, 'license').map(node => textOf(node.license)).join(' '));
  const allowedLicense = licenseUrls.find(validLicense) ??
    (licenseText.includes('(CC BY)') && !/Non.?Commercial|No.?Deriv|CC BY[ -](NC|ND)/i.test(licenseText) && validLicense(verifiedLicenseUrl) ? verifiedLicenseUrl : undefined);
  if (!allowedLicense) throw new Error('Source license is not explicit CC BY 3.0/4.0; not admitted');
  const licenseUrl = allowedLicense.replace(/^http:/, 'https:');
  if (!title || !id('doi')) throw new Error('Missing source title/DOI');
  const body = nodesNamed(parsed, 'body')[0]?.body;
  if (!body?.length) throw new Error('Source contains no full-text body');
  const passages = [];
  function walk(nodes, headings) {
    for (const node of nodes ?? []) {
      const tag = tagOf(node);
      if (['table-wrap', 'fig', 'ref-list', 'supplementary-material', 'media'].includes(tag)) continue;
      if (tag === 'sec') {
        const title = clean(textOf(node.sec.find(item => tagOf(item) === 'title')?.title));
        walk(node.sec, title ? [...headings, title] : headings);
      } else if (tag === 'p') {
        const text = clean(textOf(node.p));
        if (text.length >= 20) passages.push({ section: headings.join(' / ') || 'Body', text });
      } else if (tag !== 'title' && Array.isArray(node[tag])) walk(node[tag], headings);
    }
  }
  for (const abstract of nodesNamed(meta, 'abstract')) walk(abstract.abstract, ['Abstract']);
  walk(body, []);
  if (!passages.length) throw new Error('Source contains no extractable narrative paragraphs');
  return { title, authors, doi: id('doi'), pmcid: id('pmc'),
    license: licenseUrl.includes('/4.0') ? 'CC BY 4.0' : 'CC BY 3.0', licenseUrl, passages };
}

export function chunkPassages(passages) {
  const chunks = [];
  for (const [paragraph, passage] of passages.entries()) {
    let remaining = passage.text.trim(), part = 1;
    while (remaining) {
      let end = Math.min(1400, remaining.length);
      if (end < remaining.length) {
        const sentence = Math.max(remaining.lastIndexOf('. ', end), remaining.lastIndexOf('; ', end));
        const space = remaining.lastIndexOf(' ', end);
        end = sentence >= 700 ? sentence + 1 : space > 0 ? space : end;
      }
      const content = remaining.slice(0, end).trim();
      chunks.push({ chapter: passage.section, paragraph: paragraph + 1, part, content });
      remaining = remaining.slice(end).trim(); part++;
    }
  }
  return chunks;
}

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function stableUuid(value) {
  const s = sha256(value).slice(0, 32);
  return `${s.slice(0,8)}-${s.slice(8,12)}-5${s.slice(13,16)}-a${s.slice(17,20)}-${s.slice(20)}`;
}
