import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
const modulePath = './lib/evidence-corpus.mjs';
test('full-text importer module exists', () => assert.ok(existsSync(new URL(modulePath, import.meta.url))));
test('extracts narrative sections with license, preserves inline word order, excludes tables and references', async () => {
  const { extractArticle } = await import(modulePath);
  const xml = `<article><front><article-meta><article-id pub-id-type="pmc">PMC123</article-id><article-id pub-id-type="doi">10.123/test</article-id><title-group><article-title>Test article</article-title></title-group><permissions><license xlink:href="https://creativecommons.org/licenses/by/4.0/"><license-p>CC BY 4.0</license-p></license></permissions><abstract><p>Abstract states a limited finding.</p></abstract></article-meta></front><body><sec><title>Methods</title><p>Participants <italic>were healthy</italic> adults only.</p><table-wrap><caption><p>Do not infer this table as prose.</p></caption></table-wrap><sec><title>Limitations</title><p>Not applicable to every population.</p></sec></sec></body><back><ref-list><ref><p>Unrelated citation text.</p></ref></ref-list></back></article>`;
  const article = extractArticle(xml);
  assert.equal(article.title, 'Test article');
  assert.equal(article.doi, '10.123/test');
  assert.equal(article.license, 'CC BY 4.0');
  assert.ok(article.passages.some(p => p.text === 'Participants were healthy adults only.'));
  assert.ok(article.passages.some(p => p.section === 'Methods / Limitations'));
  assert.ok(article.passages.every(p => !p.text.includes('infer this table') && !p.text.includes('Unrelated citation')));
});
test('rejects incompatible or absent licenses rather than calling free access permission', async () => {
  const { extractArticle } = await import(modulePath);
  for (const license of ['', '<license xlink:href="https://creativecommons.org/licenses/by-nc/4.0/"/>', '<license xlink:href="https://creativecommons.org/licenses/by-nd/4.0/"/>']) {
    assert.throws(() => extractArticle(`<article><front><article-meta><title-group><article-title>Test</article-title></title-group><permissions>${license}</permissions></article-meta></front><body><p>Example passage with enough meaningful text.</p></body></article>`), /license/i);
  }
});
test('recognizes publisher JATS license link nested inside license-p', async () => {
  const { extractArticle } = await import(modulePath);
  const article = extractArticle('<article><front><article-meta><article-id pub-id-type="doi">10.123/test</article-id><title-group><article-title>Test</article-title></title-group><permissions><license><license-p>Reuse under <ext-link xlink:href="https://creativecommons.org/licenses/by/4.0/">CC BY</ext-link></license-p></license></permissions></article-meta></front><body><p>A complete narrative paragraph for indexing.</p></body></article>');
  assert.equal(article.license, 'CC BY 4.0');
});
test('chunks are bounded and deterministic without joining across source sections', async () => {
  const { chunkPassages, stableUuid } = await import(modulePath);
  const passages = [{ section: 'Population', text: 'Healthy adults only. '.repeat(100) }, { section: 'Limits', text: 'Not a personal treatment protocol.' }];
  const chunks = chunkPassages(passages);
  assert.ok(chunks.length > 2);
  assert.ok(chunks.every(c => c.content.length <= 1400));
  assert.equal(chunks.at(-1).chapter, 'Limits');
  assert.deepEqual(chunks, chunkPassages(passages));
  assert.equal(stableUuid('same'), stableUuid('same'));
  assert.notEqual(stableUuid('same'), stableUuid('changed model'));
});
test('publisher-verified license URL supplements explicit CC BY text, never an absent license', async () => {
  const { extractArticle } = await import(modulePath);
  const make = license => `<article><front><article-meta><article-id pub-id-type="doi">10.123/test</article-id><title-group><article-title>Test</article-title></title-group><permissions>${license}</permissions></article-meta></front><body><p>A complete narrative paragraph for indexing.</p></body></article>`;
  const options = { verifiedLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/' };
  assert.equal(extractArticle(make('<license><license-p>Creative Commons Attribution License (CC BY).</license-p></license>'), options).license, 'CC BY 4.0');
  assert.throws(() => extractArticle(make(''), options), /license/i);
});
