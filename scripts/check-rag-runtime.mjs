import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';
const corpus = () => ({ namespace: 'evidence-v1:google/gemini-embedding-2:1536:qa-v1', model: 'google/gemini-embedding-2', dimensions: 1536,
  sources: [{ documentId: 'test-document', title: 'WHO activity guideline', canonicalUrl: 'https://doi.org/10.1136/bjsports-2020-102955',
    license: 'CC BY 4.0', checkedAt: '2026-10-26', year: '2020', kind: 'guideline-summary', chunkCount: 1, access: 'Narrative full-text paragraphs only.' }] });
function runtime(documents, { score = 0.6, indexedCount = 1, queryError = null } = {}) {
  let embedded = 0, called = 0;
  const catalog = corpus();
  const db = { from(table) {
    if (table === 'knowledge_documents') return { select: async () => ({ data: documents, error: null }) };
    const chain = { in: () => chain, not: async () => ({ count: indexedCount, error: queryError }) };
    return { select: () => chain };
  }, rpc: async () => { called++; return { data: [{ id: 'chunk', document_id: catalog.sources[0].documentId,
    title: catalog.sources[0].title, chapter: 'Methods', page: null, content: 'A source passage.', score }], error: null }; } };
  const load = createAppLoader({ mocks: {
    '@/lib/knowledge/corpus.json': catalog,
    '@/lib/supabase/server': { hasSupabase: () => true, supabase: () => db },
    '@/lib/ai/openrouter': { MODELS: { embedding: catalog.model }, EMBEDDING_DIMENSIONS: 1536,
      EMBEDDING_NAMESPACE: catalog.namespace, embedTexts: async (_texts, options) => {
        embedded++; assert.equal(options.task, 'query'); return [Array(1536).fill(0.01)];
      } },
  } });
  return { rag: load('src/lib/tools/rag-search.ts'), counts: () => ({ embedded, called }) };
}
test('RAG exposes structured retrieval status', async () => {
  const r = runtime([]);
  assert.equal(typeof r.rag.retrieveKnowledge, 'function');
  const result = await r.rag.retrieveKnowledge('question');
  assert.equal(result.retrieval.status, 'empty');
  assert.equal(r.counts().embedded, 0);
});
test('never compares incompatible or unregistered vectors, even with the same dimension', async () => {
  const r = runtime([{ id: 'old-document', source_type: 'pdf' }]);
  const result = await r.rag.retrieveKnowledge('question');
  assert.equal(result.retrieval.status, 'incompatible');
  assert.equal(result.hits.length, 0);
  assert.deepEqual(r.counts(), { embedded: 0, called: 0 });
});
test('query uses current namespace, adds provenance and preserves source locator in prompt', async () => {
  const docs = corpus().sources.map(s => ({ id: s.documentId, source_type: corpus().namespace }));
  const r = runtime(docs);
  const result = await r.rag.retrieveKnowledge('hoạt động thể chất');
  assert.equal(result.retrieval.status, 'ready');
  assert.equal(result.hits[0].url, corpus().sources[0].canonicalUrl);
  assert.equal(result.hits[0].license, 'CC BY 4.0');
  const context = r.rag.formatRag(result.hits);
  assert.ok(context.includes('[RAG:chunk]'));
  assert.ok(context.includes(result.hits[0].url));
  assert.ok(context.includes('Methods'));
});
test('weak vector match is reported as no match rather than supplied as evidence', async () => {
  const docs = corpus().sources.map(s => ({ id: s.documentId, source_type: corpus().namespace }));
  const r = runtime(docs, { score: 0.05 });
  const result = await r.rag.retrieveKnowledge('unrelated question');
  assert.equal(result.retrieval.status, 'no_matches');
  assert.equal(result.hits.length, 0);
});

test('partially indexed or failed corpus never contacts embedding or vector RPC', async () => {
  const docs = corpus().sources.map(s => ({ id: s.documentId, source_type: corpus().namespace }));
  for (const [options, expected] of [[{ indexedCount: 0 }, 'indexing'], [{ queryError: { code: 'test' } }, 'error']]) {
    const r = runtime(docs, options);
    const result = await r.rag.retrieveKnowledge('question');
    assert.equal(result.retrieval.status, expected);
    assert.equal(result.hits.length, 0);
    assert.deepEqual(r.counts(), { embedded: 0, called: 0 });
  }
});
