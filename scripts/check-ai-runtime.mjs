import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function runtime(fetcher, env = {}) {
  const exports = {};
  const text = readFileSync('src/lib/ai/openrouter.ts', 'utf8');
  vm.runInNewContext(ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, process: { env: { OPENROUTER_API_KEY: 'test-key', ...env } }, fetch: fetcher, AbortSignal, TextDecoder, TextEncoder, URL, setTimeout, clearTimeout }, { filename: 'openrouter.ts' });
  return exports;
}
const vector = () => Array.from({ length: 1536 }, (_, i) => i === 0 ? 1 : 0);
test('all default chat routes use Gemini 2.5 Flash, embedding uses Gemini 2', () => {
  const ai = runtime(() => {});
  assert.equal(ai.MODELS.clinical, 'google/gemini-2.5-flash');
  assert.equal(ai.MODELS.fast, 'google/gemini-2.5-flash');
  assert.equal(ai.MODELS.embedding, 'google/gemini-embedding-2');
  assert.equal(ai.pickChatModel({ text: 'đau gối', clientId: 'synthetic' }), 'google/gemini-2.5-flash');
  assert.equal(ai.pickChatModel({ text: 'kiến thức bài tập' }), 'google/gemini-2.5-flash');
});
test('query has retrieval task prefix and requests 1536 dimensions', async () => {
  let sent;
  const ai = runtime(async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ data: [{ index: 0, embedding: vector() }] }) };
  });
  const result = await ai.embedTexts(['đau lưng khi tập'], { task: 'query' });
  assert.equal(sent.model, 'google/gemini-embedding-2');
  assert.equal(sent.dimensions, 1536);
  assert.equal(sent.input[0], 'task: question answering | query: đau lưng khi tập');
  assert.equal(result[0].length, 1536);
});
test('documents are separate and preserve title, output index order', async () => {
  let sent;
  const v2 = vector(); v2[0] = 0; v2[1] = 1;
  const ai = runtime(async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ data: [{ index: 1, embedding: v2 }, { index: 0, embedding: vector() }] }) };
  });
  const result = await ai.embedTexts(['first passage', 'second passage'], { task: 'document', titles: ['WHO', 'Review'] });
  assert.deepEqual(sent.input, ['title: WHO | text: first passage', 'title: Review | text: second passage']);
  assert.equal(result.length, 2);
  assert.equal(result[0][0], 1);
  assert.equal(result[1][1], 1);
});
test('rejects wrong dimensions, duplicate/missing indices and nonfinite vectors before database use', async () => {
  for (const data of [
    [{ index: 0, embedding: [1, 2] }],
    [{ index: 0, embedding: vector() }, { index: 0, embedding: vector() }],
    [],
    [{ index: 0, embedding: vector().map((v, i) => i === 1 ? NaN : v) }],
    [{ index: 0, embedding: Array(1536).fill(0) }],
  ]) {
    const ai = runtime(async () => ({ ok: true, json: async () => ({ data }) }));
    await assert.rejects(ai.embedTexts(['passage'], { task: 'document' }), /embedding|vector|dimension|index/i);
  }
});
test('empty batch does not contact provider', async () => {
  const ai = runtime(() => { throw new Error('unwanted network'); });
  assert.equal((await ai.embedTexts([], { task: 'document' })).length, 0);
});
