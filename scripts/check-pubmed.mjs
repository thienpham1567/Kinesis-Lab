import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';

function fixture() {
  const requested = [];
  const load = createAppLoader({ globals: { URLSearchParams, process: { env: {} }, fetch: async url => {
    requested.push(new URL(url));
    return Response.json({ esearchresult: { idlist: [] } });
  } } });
  return { ...load('src/lib/tools/pubmed.ts'), requested };
}
test('trusted server query reaches PubMed literally without translation or an exercise filter', async () => {
  const f = fixture();
  const query = '("deltoid"[Title/Abstract]) AND (anatomy OR biomechanics OR function)';
  await f.searchPubMed(query, 4, { queryMode: 'trusted' });
  assert.equal(f.requested[0].searchParams.get('term'), query);
  assert.equal(f.requested[0].searchParams.get('retmax'), '4');
});
test('default PubMed callers retain Vietnamese mapping and exercise filtering', async () => {
  const f = fixture();
  await f.searchPubMed('học viên thoát vị đĩa đệm');
  assert.equal(f.requested[0].searchParams.get('term'), f.pubmedQuery('học viên thoát vị đĩa đệm'));
  assert.match(f.requested[0].searchParams.get('term'), /intervertebral disc herniation/);
  assert.match(f.requested[0].searchParams.get('term'), /exercise OR/);
});
test('missing abstracts and labeled abstracts remain honest in parsing and formatting', () => {
  const f = fixture();
  const abstracts = f.parseAbstracts('<PubmedArticle><PMID>123</PMID><AbstractText Label="METHODS">A &amp; B <i>text</i>.</AbstractText></PubmedArticle>');
  assert.match(abstracts['123'], /A & B text/);
  assert.match(f.formatPubMed([{ pmid: '456', title: 'Title only', abstract: '', url: 'https://pubmed.ncbi.nlm.nih.gov/456/', year: '2020', journal: '' }]), /không có abstract/);
});

test('abstract parsing preserves structured conclusions beyond the old 1200 character cutoff', () => {
  const f = fixture();
  const xml = `<PubmedArticle><PMID>123</PMID><AbstractText Label="METHODS">${'Method. '.repeat(250)}</AbstractText><AbstractText Label="CONCLUSIONS">No difference was detected; equivalence was not tested.</AbstractText></PubmedArticle>`;
  assert.match(f.parseAbstracts(xml)['123'], /CONCLUSIONS: No difference was detected; equivalence was not tested/);
});

test('retrieval excludes identified retractions and keeps publication types', async () => {
  const load = createAppLoader({ globals: { URLSearchParams, process: { env: {} }, fetch: async url => {
    if (String(url).includes('esearch')) return Response.json({ esearchresult: { idlist: ['123', '456'] } });
    if (String(url).includes('esummary')) return Response.json({ result: {
      '123': { title: 'Retracted trial', pubtype: ['Retracted Publication'] },
      '456': { title: 'Useful synthesis', pubtype: ['Systematic Review'] },
    } });
    return new Response('<PubmedArticle><PMID>456</PMID><AbstractText>Available abstract.</AbstractText></PubmedArticle>');
  } } });
  const papers = await load('src/lib/tools/pubmed.ts').searchPubMed('exercise');
  assert.deepEqual(papers.map(p => p.pmid), ['456']);
  assert.deepEqual(papers[0].publicationTypes, ['Systematic Review']);
});

test('PubMed application errors are failures rather than empty-source successes', async () => {
  const load = createAppLoader({ globals: { URLSearchParams, process: { env: {} }, fetch: async () => Response.json({ error: 'API rate limit exceeded' }) } });
  await assert.rejects(load('src/lib/tools/pubmed.ts').searchPubMed('exercise'), /PubMed/);
});

test('simultaneous identical public searches share a bounded request', async () => {
  const f = fixture();
  await Promise.all([f.searchPubMed('fixed topic'), f.searchPubMed('fixed topic')]);
  assert.equal(f.requested.length, 1);
});

test('long abstracts disclose truncation while retaining the final conclusion', async () => {
  const load = createAppLoader({ globals: { URLSearchParams, process: { env: {} }, fetch: async url => {
    if (String(url).includes('esearch')) return Response.json({ esearchresult: { idlist: ['123'] } });
    if (String(url).includes('esummary')) return Response.json({ result: { '123': { title: 'Long abstract' } } });
    return new Response(`<PubmedArticle><PMID>123</PMID><AbstractText>${'Method. '.repeat(2300)}</AbstractText><AbstractText Label="CONCLUSIONS">No equivalence test.</AbstractText></PubmedArticle>`);
  } } });
  const p = load('src/lib/tools/pubmed.ts');
  const papers = await p.searchPubMed('fixed long abstract');
  assert.equal(papers[0].abstractTruncated, true);
  assert.match(papers[0].abstract, /CONCLUSIONS: No equivalence test/);
  assert.match(p.formatPubMed(papers), /đã lược phần giữa/);
});
