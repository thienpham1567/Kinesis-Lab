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
