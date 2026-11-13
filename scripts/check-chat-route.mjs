import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';
import * as anatomyEvidence from '../src/lib/clinical/anatomy-evidence.mjs';
import * as catalogCorrections from '../src/lib/clinical/atlas-catalog-corrections.mjs';

function fixture({ wire, upstreamError, literatureError = false, clientStore, env = {}, remote } = {}) {
  const calls = { model: 0, retrieval: [], public: [], messages: [] };
  const load = createAppLoader({
    globals: { process: { env: { OPENROUTER_API_KEY: 'synthetic-only', ...env } } },
    mocks: {
      './anatomy-evidence.mjs': anatomyEvidence,
      './atlas-catalog-corrections.mjs': catalogCorrections,
      '@/lib/supabase/server': { hasSupabase: () => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY), supabase:()=>remote },
      '@/lib/local-store': { readLocalStore: () => clientStore ?? ({ clients: [], biomarkers: [] }) },
      '@/lib/ai/openrouter': {
        pickChatModel: () => 'google/gemini-2.5-flash',
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

test('chat model choice accepts only the two Gemini Flash models', async () => {
  const f = fixture();
  const chosen = await events(await f.post({ ...question('hello'), model: 'google/gemini-3.8-flash' }));
  assert.equal(chosen[0].model, 'google/gemini-3.8-flash');
  const ignored = await events(await f.post({ ...question('hello'), model: 'openai/gpt-5' }));
  assert.equal(ignored[0].model, 'google/gemini-2.5-flash');
  assert.equal((await f.post({ ...question('hello'), model: 1 })).status, 400);
  assert.equal(f.calls.model, 2);
});

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
  assert.equal(e[0].model, 'google/gemini-2.5-flash');
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

test('retired study assistant requests never call the model', async () => {
  const f = fixture();
  for (const fields of [{ studyPage: '/atlas' }, { studyStructureId: 'synthetic' }]) {
    assert.equal((await f.post({ ...question('hello'), ...fields })).status, 410);
  }
  assert.equal(f.calls.model, 0);
  assert.equal(f.calls.retrieval.length, 0);
});

test('a fabricated or placeholder RAG reference produces a visible warning', async () => {
  for (const content of ['See [RAG:invented-id]', 'No source [RAG:... không có]']) {
    const wire = 'data: ' + JSON.stringify({ choices: [{ delta: { content }, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n';
    const e = await events(await fixture({ wire }).post(question('hello')));
    assert.equal(e.at(-1).type, 'done');
    assert.ok(e.some(event => event.type === 'warning' && event.text.includes('không khớp')));
  }
});

test('invented APP indices, PMIDs and URLs produce source identity warnings', async () => {
  for (const content of ['[APP:medication:general:999]', '[APP:medication:general, 999]', '[APP:medication:general 999]', '[APP:medication:general] [999]', '[PMID:999999999]', '[Nguồn](https://invented.example/medical)']) {
    const wire = 'data: ' + JSON.stringify({ choices: [{ delta: { content }, finish_reason: 'stop' }] }) + '\n\ndata: [DONE]\n\n';
    const e = await events(await fixture({ wire }).post(question('insulin medication')));
    assert.ok(e.some(event => event.type === 'warning' && event.text.includes('không khớp')), content);
  }
});

test('client chat receives bounded legacy and prescribed workout observations', async()=>{
 const client={id:'synthetic-client',name:'Synthetic',age:30,sex:'Nam',goals:'Test',training_level:'Test',medical_conditions:[],medications:[],orthopedic_issues:[],red_flags:{parq:{},notes:''}};
 const f=fixture({clientStore:{clients:[client],biomarkers:[],training_records:[{client_id:client.id,recorded_at:'2026-11-06',exercise_id:'synthetic-exercise',sets:2,reps:8,load:null,load_unit:'bodyweight',rpe:5,feedback:'SYNTHETIC_LEGACY_FEEDBACK'}],training_workouts:[{client_id:client.id,performedAt:'2026-11-06',status:'in_progress',rpe:null,notes:'SYNTHETIC_WORKOUT_NOTE',prescription:{exercises:[{id:'row',name:'Synthetic variant',exerciseId:null,sets:1,repMin:8,repMax:12,load:null,loadUnit:'bodyweight'}]},sets:[{exerciseId:'row',setNumber:1,reps:null,load:null,loadUnit:'bodyweight',completed:false}]}]}});
 const response=await f.post({...question('hello'),clientId:client.id});assert.equal(response.status,200);await events(response);
 const system=f.calls.messages[0].content;assert.ok(system.includes('SYNTHETIC_LEGACY_FEEDBACK'));assert.ok(system.includes('SYNTHETIC_WORKOUT_NOTE'));assert.ok(system.includes('Synthetic variant'));
});

test('client chat refuses partial configuration and failed profile queries before AI access',async()=>{
 const partial=fixture({env:{SUPABASE_URL:'https://synthetic.invalid'}});
 assert.equal((await partial.post({...question('hello'),clientId:'synthetic-client'})).status,503);assert.equal(partial.calls.model,0);
 const query={select(){return this},eq(){return this},order(){return this},single:async()=>({data:null,error:{message:'PRIVATE_DATABASE_ERROR'}}),limit:async()=>({data:null,error:{message:'PRIVATE_DATABASE_ERROR'}})};
 const failed=fixture({env:{SUPABASE_URL:'https://synthetic.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic'},remote:{from:()=>query}});
 const res=await failed.post({...question('hello'),clientId:'synthetic-client'});assert.equal(res.status,503);assert.ok(!(await res.text()).includes('PRIVATE_DATABASE_ERROR'));assert.equal(failed.calls.model,0);
});
