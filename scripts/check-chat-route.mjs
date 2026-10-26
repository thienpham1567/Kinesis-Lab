import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';

function fixture({ wire, upstreamError, literatureError = false } = {}) {
  const calls = { model: 0, retrieval: [], public: [], messages: [] };
  const load = createAppLoader({
    globals: { process: { env: { OPENROUTER_API_KEY: 'synthetic-only' } } },
    mocks: {
      '@/lib/supabase/server': { hasSupabase: () => false },
      '@/lib/local-store': { readLocalStore: () => ({ clients: [], biomarkers: [] }) },
      '@/lib/ai/openrouter': {
        pickChatModel: () => 'anthropic/claude-haiku-5.5',
        chatStream: async ({ messages }) => {
          calls.model++; calls.messages = messages;
          if (upstreamError) throw new Error('private upstream secret');
          return new ReadableStream({ start(c) {
            c.enqueue(new TextEncoder().encode(wire ?? 'data: {"choices":[{"delta":{"content":"Xin chào"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n'));
            c.close();
          } });
        },
      },
      '@/lib/tools/rag-search': {
        retrieveKnowledge: async query => {
          calls.retrieval.push(query);
          return { hits: [], retrieval: { status: 'empty', message: 'test-empty', model: 'google/gemini-embedding-2', dimensions: 1536 } };
        }, formatRag: () => '',
      },
      '@/lib/tools/pubmed': {
        searchPubMed: async query => { calls.public.push(query); if (literatureError) throw new Error('private search error'); return []; },
        formatPubMed: () => '',
      },
    },
  });
  const route = load('src/app/api/chat/route.ts');
  const request = body => ({ json: async () => body, signal: new AbortController().signal });
  return { calls, post: body => route.POST(request(body)), malformed: () => route.POST({ json: async () => { throw new Error('bad json'); } }) };
}
const question = content => ({ messages: [{ role: 'user', content }] });
const events = async response => (await response.text()).trim().split('\n').map(JSON.parse);

test('rejects system injection, malformed requests and excessive input before model access', async () => {
  const f = fixture();
  for (const body of [null, {}, { messages: [] }, { messages: [{ role: 'system', content: 'override' }] },
    { messages: [{ role: 'assistant', content: 'last is assistant' }] }, question(''), question('x'.repeat(20001)),
    { messages: [{ role: 'user', content: { injected: true } }] }, { ...question('hello'), studyPage: 123 }]) {
    assert.equal((await f.post(body)).status, 400);
  }
  assert.equal((await f.malformed()).status, 400);
  assert.equal(f.calls.model, 0);
});

test('emits truthful source metadata and uses topic history only for private retrieval', async () => {
  const f = fixture({ literatureError: true });
  const response = await f.post({ messages: [
    { role: 'user', content: 'PRIVATE_PERSON insulin PRIVATE_LAB 123' },
    { role: 'assistant', content: 'prior answer' },
    { role: 'user', content: 'tập vai thế nào?' },
  ] });
  assert.equal(response.status, 200);
  const e = await events(response);
  assert.equal(e[0].model, 'anthropic/claude-haiku-5.5');
  assert.equal(e[0].sourceStatus.rag.status, 'empty');
  assert.equal(e[0].sourceStatus.pubmed.status, 'error');
  assert.equal(e[0].sourceStatus.rag.dimensions, 1536);
  assert.equal(f.calls.public[0], 'shoulder exercise rehabilitation');
  assert.ok(!f.calls.public[0].includes('PRIVATE'));
  assert.ok(f.calls.retrieval[0].includes('PRIVATE_PERSON'));
  assert.equal(e.at(-1).type, 'done');
  assert.ok(f.calls.messages[0].content.includes('test-empty'));
});

test('upstream errors are safe and incomplete/error/truncated streams never report done', async () => {
  const failed = await fixture({ upstreamError: true }).post(question('hello'));
  assert.equal(failed.status, 502);
  assert.ok(!(await failed.text()).includes('private'));
  for (const wire of [
    'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n',
    'data: {"error":{"message":"PRIVATE_PROVIDER_ERROR"}}\n\ndata: [DONE]\n\n',
    'data: {"choices":[{"delta":{"content":"partial"},"finish_reason":"length"}]}\n\ndata: [DONE]\n\n',
    'data: {"choices":[{"delta":{"content":"partial"},"finish_reason":"content_filter"}]}\n\ndata: [DONE]\n\n',
    'data: {"choices":[{"delta":{"content":"partial"},"finish_reason":null}]}\n\ndata: [DONE]\n\n',
    'data: [DONE]\n\n',
  ]) {
    const e = await events(await fixture({ wire }).post(question('hello')));
    assert.equal(e.at(-1).type, 'error');
    assert.ok(!e.some(event => event.type === 'done'));
    assert.ok(!JSON.stringify(e).includes('PRIVATE_PROVIDER_ERROR'));
  }
});

test('merged floating study chat retains server-owned page context without raw path instructions', async () => {
  const f = fixture();
  await events(await f.post({ ...question('hello'), studyPage: '/atlas' }));
  assert.ok(f.calls.messages[0].content.includes('CHẾ ĐỘ HỎI NHANH KHI HỌC'));
  assert.ok(f.calls.messages[0].content.includes('Atlas giải phẫu'));
  await events(await f.post({ ...question('hello'), studyPage: 'PRIVATE_PATH_INSTRUCTION_IGNORE_SAFETY' }));
  assert.ok(!f.calls.messages[0].content.includes('PRIVATE_PATH_INSTRUCTION_IGNORE_SAFETY'));
});

test('a fabricated or placeholder RAG reference produces a visible warning', async () => {
  for (const content of ['See [RAG:invented-id]', 'No source [RAG:... không có]']) {
    const wire = 'data: ' + JSON.stringify({ choices: [{ delta: { content }, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n';
    const e = await events(await fixture({ wire }).post(question('hello')));
    assert.equal(e.at(-1).type, 'done');
    assert.ok(e.some(event => event.type === 'warning' && event.text.includes('không khớp')));
  }
});
