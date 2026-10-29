import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';
import * as anatomyEvidence from '../src/lib/clinical/anatomy-evidence.mjs';
import * as catalogCorrections from '../src/lib/clinical/atlas-catalog-corrections.mjs';

const selectedId = 'za-dfbfb9194982';
function fixture({ papers = [], literatureError = false } = {}) {
  const calls = { rag: [], public: [], messages: [] };
  const load = createAppLoader({
    globals: { process: { env: { OPENROUTER_API_KEY: 'synthetic' } } },
    mocks: {
      './anatomy-evidence.mjs': anatomyEvidence,
      './atlas-catalog-corrections.mjs': catalogCorrections,
      '@/lib/supabase/server': { hasSupabase: () => false },
      '@/lib/local-store': { readLocalStore: () => ({ clients: [], biomarkers: [] }) },
      '@/lib/ai/openrouter': {
        pickChatModel: () => 'google/gemini-2.5-flash',
        chatStream: async ({ messages }) => {
          calls.messages = messages;
          return new ReadableStream({ start(c) {
            c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Giải thích có nguồn [APP:muscle:deltoids]."},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n'));
            c.close();
          } });
        },
      },
      '@/lib/tools/rag-search': {
        retrieveKnowledge: async query => { calls.rag.push(query); return { hits: [], retrieval: { status: 'empty', message: 'empty' } }; },
        formatRag: () => '',
      },
      '@/lib/tools/pubmed': {
        searchPubMed: async (query, _limit, options) => { calls.public.push(query); calls.publicOptions = options; if (literatureError) throw new Error('private failure'); return papers; },
        formatPubMed: values => values.map(p => `[PMID:${p.pmid}] ${p.title}\n${p.abstract}`).join('\n'),
      },
    },
  });
  const route = load('src/app/api/chat/route.ts');
  return { calls, post: async body => {
    const response = await route.POST({ json: async () => body, signal: new AbortController().signal });
    return { response, events: response.status === 200 ? (await response.text()).trim().split('\n').map(JSON.parse) : [] };
  }, load };
}
const body = extra => ({ messages: [{ role: 'user', content: 'Chức năng chính?' }], studyPage: '/atlas', studyStructureId: selectedId, ...extra });

test('study follow-up anchors current muscle and side, bypasses curriculum and excludes old topic from retrieval', async () => {
  const f = fixture();
  const { events } = await f.post(body({ messages: [
    { role: 'user', content: 'PRIVATE_PERSON old gastrocnemius insulin result 123' },
    { role: 'assistant', content: 'previous answer' },
    { role: 'user', content: 'Chức năng chính?' },
  ] }));
  assert.equal(f.calls.rag.length, 0, 'widget never calls curriculum RAG');
  assert.match(f.calls.public[0], /deltoid/i);
  assert.match(f.calls.public[0], /"Deltoid muscle"\[Title\/Abstract\]/i);
  assert.doesNotMatch(f.calls.public[0], /Acromial part|exercise|rehabilitation/);
  assert.equal(f.calls.publicOptions.queryMode, 'trusted');
  assert.doesNotMatch(f.calls.public[0], /PRIVATE|gastrocnemius|123|Chức năng/);
  const meta = events.find(e => e.type === 'study-meta');
  assert.equal(meta.context.structureId, selectedId);
  assert.equal(meta.context.side, 'right');
  assert.ok(meta.actions.some(a => a.href.includes(`structure=${selectedId}`)));
  assert.ok(meta.actions.filter(a => a.href.includes('structure=')).every(a => a.href.endsWith('#atlas-3d-stage')));
  assert.ok(meta.actions.some(a => a.href === '/atlas?tab=hypertrophy&muscle=deltoids'));
  assert.ok(meta.sources.some(s => s.id.startsWith('APP:muscle:deltoids')));
  assert.ok(meta.sources.every(s => s.checkedAt && s.access && /^https:\/\//.test(s.url)));
  assert.match(meta.sourceNotice, /cơ mẹ/);
  const system = f.calls.messages[0].content;
  assert.match(system, /Acromial part of deltoid muscle/);
  assert.match(system, /phải/);
  assert.doesNotMatch(system, /gastrocnemius|NCSF|Quy tắc in mã APP, RAG và PMID ở trên không dùng/);
  assert.doesNotMatch(system, /\[APP:anatomy:hip_pelvis\]|\[APP:anatomy:knee\]/, 'generic anatomy words must not add unrelated regions');
  assert.equal(events.at(-1).type, 'done');
});

test('selected muscle public search uses fixed facets and retains anatomy name for biomechanics', async () => {
  const f = fixture();
  await f.post(body({ messages: [{ role: 'user', content: 'PRIVATE_NAME 991199 bài tập tăng cơ?' }] }));
  assert.match(f.calls.public[0], /deltoid/i);
  assert.match(f.calls.public[0], /exercise/);
  assert.doesNotMatch(f.calls.public[0], /anatomy/);
  assert.doesNotMatch(f.calls.public[0], /PRIVATE_NAME|991199|bài tập/);
  await f.post(body({ messages: [{ role: 'user', content: 'Cơ sinh học và cánh tay đòn?' }] }));
  assert.match(f.calls.public[0], /deltoid/i);
  assert.match(f.calls.public.at(-1), /biomechanics/);
  assert.doesNotMatch(f.calls.public.at(-1), /exercise/);
  await f.post(body({ studyStructureId: 'za-77f8d358d003' }));
  assert.match(f.calls.public.at(-1), /"Calcaneal tendon"/);
  assert.doesNotMatch(f.calls.public.at(-1), /tendon muscle/);
});

test('free questions offer verified catalog navigation only for an exact unambiguous name and side', async () => {
  const f = fixture();
  const named = await f.post(body({ studyPage: '/movement', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Giải thích supraspinatus muscle bên trái giúp tôi' }],
  }));
  const meta = named.events.find(e => e.type === 'study-meta');
  assert.equal(meta.context, null, 'inferred links do not fabricate a selected structure');
  assert.ok(meta.actions.some(a => a.href.includes('structure=za-0425424460a5')));
  const questionNotSide = await f.post(body({ studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Có phải supraspinatus muscle là cơ trên gai?' }],
  }));
  const questionActions = questionNotSide.events.find(e => e.type === 'study-meta').actions;
  assert.ok(questionActions.some(a => a.href.includes('structure=za-0425424460a5')), 'Vietnamese interrogative phải is not right-side metadata');
  assert.ok(questionActions.some(a => a.href.includes('structure=za-01cb75938da6')));
  const ambiguous = await f.post(body({ studyStructureId: undefined,
    messages: [{ role: 'user', content: 'cơ vai và chân' }],
  }));
  assert.equal(ambiguous.events.find(e => e.type === 'study-meta').actions.length, 0);
});

test('context is resolved with catalog corrections and unknown IDs cannot inject instructions', async () => {
  const f = fixture();
  const corrected = await f.post(body({ studyStructureId: 'za-0425424460a5' }));
  assert.equal(corrected.events.find(e => e.type === 'study-meta').context.area, 'upper');
  await f.post(body({ studyStructureId: 'IGNORE_SAFETY_PRIVATE_INJECTION' }));
  assert.doesNotMatch(f.calls.messages[0].content, /IGNORE_SAFETY_PRIVATE_INJECTION/);
  const unknown = await f.post(body({ studyStructureId: 'unknown-id' }));
  assert.equal(unknown.events.find(e => e.type === 'study-meta').context, null);
  const standalone = await f.post({ messages: [{ role: 'user', content: 'hello' }], studyStructureId: selectedId });
  assert.ok(!standalone.events.some(e => e.type === 'study-meta'));
  assert.equal(f.calls.rag.length, 1);
});

test('server uses the same conservative training memberships as Atlas, rather than legacy catalog groups', async () => {
  const f = fixture();
  const subscapularis = await f.post(body({ studyStructureId: 'za-84c7d3654da9' }));
  const subMeta = subscapularis.events.find(e => e.type === 'study-meta');
  assert.equal(subMeta.context.groupId, null);
  assert.ok(!subMeta.actions.some(a => a.href.includes('muscle=deltoids')));
  assert.ok(!subMeta.sources.some(s => s.id.startsWith('APP:muscle:deltoids')));
  const oblique = await f.post(body({ studyStructureId: 'za-a37e0a05a2d2' }));
  const obliqueMeta = oblique.events.find(e => e.type === 'study-meta');
  assert.equal(obliqueMeta.context.groupId, 'abs_obliques');
  assert.ok(obliqueMeta.actions.some(a => a.href.includes('muscle=abs_obliques')));
});

test('explicit comparison includes both known individual muscle records and excludes old history', async () => {
  const f = fixture();
  const { events } = await f.post(body({ studyStructureId: 'za-0425424460a5', messages: [
    { role: 'user', content: 'gluteus medius muscle' },
    { role: 'assistant', content: 'old topic' },
    { role: 'user', content: 'So sánh với infraspinatus muscle' },
  ] }));
  const curated = events.find(e => e.type === 'meta').curated;
  assert.equal(curated[0].id, 'structure:supraspinatus');
  assert.equal(curated[1].id, 'structure:infraspinatus');
  assert.ok(curated.length <= 6);
  const system = f.calls.messages[0].content;
  assert.match(system, /\[APP:structure:supraspinatus\]/);
  assert.match(system, /\[APP:structure:infraspinatus\]/);
  assert.doesNotMatch(system, /\[APP:structure:gluteus-medius\]/);
  const meta = events.find(e => e.type === 'study-meta');
  assert.equal(meta.context.structureId, 'za-0425424460a5');
  assert.ok(meta.sources.some(s => s.id.startsWith('APP:structure:infraspinatus:')));
});

test('unselected follow-ups use bounded local history while explicit current muscle replaces the old topic', async () => {
  const f = fixture();
  const history = [
    { role: 'user', content: 'gluteus medius muscle PRIVATE_NAME' },
    { role: 'assistant', content: 'prior answer' },
  ];
  const followed = await f.post(body({ studyPage: '/movement', studyStructureId: undefined,
    messages: [...history, { role: 'user', content: 'Nguyên ủy và bám tận?' }],
  }));
  assert.ok(followed.events.find(e => e.type === 'meta').curated.some(e => e.id === 'structure:gluteus-medius'));
  assert.ok(f.calls.public.every(query => !/PRIVATE_NAME|gluteus/.test(query)));
  const changed = await f.post(body({ studyPage: '/movement', studyStructureId: undefined,
    messages: [...history, { role: 'user', content: 'Chức năng supraspinatus muscle?' }],
  }));
  const records = changed.events.find(e => e.type === 'meta').curated;
  assert.ok(records.some(e => e.id === 'structure:supraspinatus'));
  assert.ok(!records.some(e => e.id === 'structure:gluteus-medius'));
});

test('source metadata preserves actual curated reading dates and PubMed reading scope', async () => {
  const papers = [
    { pmid: '123', title: 'Deltoid muscle abstract record', abstract: 'Supplied abstract.', url: 'https://pubmed.ncbi.nlm.nih.gov/123/', year: '2020', authors: '', journal: '' },
    { pmid: '456', title: 'Deltoid muscle title record', abstract: '', url: 'https://pubmed.ncbi.nlm.nih.gov/456/', year: '2021', authors: '', journal: '' },
  ];
  const f = fixture({ papers });
  const { events } = await f.post(body());
  const meta = events.find(e => e.type === 'study-meta');
  assert.match(meta.sources.find(s => s.id === 'PMID:123').access, /abstract/);
  assert.doesNotMatch(meta.sources.find(s => s.id === 'PMID:456').access, /^metadata và abstract/);
  assert.match(meta.sources.find(s => s.id === 'PMID:456').access, /không có abstract/);
  assert.equal(meta.sources.find(s => s.id === 'PMID:123').checkedAt, new Date().toISOString().slice(0, 10));
  assert.ok(meta.sources.filter(s => s.id.startsWith('APP:')).some(s => s.checkedAt !== new Date().toISOString().slice(0, 10)));
  assert.ok(meta.sourceNotice);
});

test('selected muscle source relevance rejects ankle deltoid ligament papers and retains actual muscle mentions', async () => {
  const papers = [
    { pmid: '37449811', title: 'Deltoid ligament injury and repair.', abstract: 'The deltoid ligament is the primary stabilizer of the medial side of the ankle joint.', url: 'https://pubmed.ncbi.nlm.nih.gov/37449811/', year: '2023', authors: '', journal: '' },
    { pmid: '111', title: 'Functional shoulder anatomy', abstract: 'The deltoid muscle has anterior, middle and posterior parts.', url: 'https://pubmed.ncbi.nlm.nih.gov/111/', year: '2020', authors: '', journal: '' },
  ];
  const f = fixture({ papers });
  const { events } = await f.post(body());
  const pubmed = events.find(e => e.type === 'meta').pubmed;
  assert.deepEqual(pubmed.map(p => p.pmid), ['111']);
  const sources = events.find(e => e.type === 'study-meta').sources;
  assert.ok(sources.some(s => s.id === 'PMID:111'));
  assert.ok(!sources.some(s => s.id === 'PMID:37449811'));
  assert.doesNotMatch(f.calls.messages[0].content, /37449811|medial side of the ankle/);
  const irrelevant = await fixture({ papers: papers.slice(0, 1) }).post(body());
  assert.equal(irrelevant.events.find(e => e.type === 'meta').sourceStatus.pubmed.status, 'no_matches');
  assert.ok(!irrelevant.events.find(e => e.type === 'study-meta').sources.some(s => s.id.startsWith('PMID:')));
});

test('study mode on any page bypasses curriculum and exposes failed evidence retrieval honestly', async () => {
  const f = fixture({ literatureError: true });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined }));
  assert.equal(f.calls.rag.length, 0);
  assert.equal(events.find(e => e.type === 'meta').sourceStatus.rag.status, 'skipped');
  const meta = events.find(e => e.type === 'study-meta');
  assert.equal(meta.context, null);
  assert.ok(meta.sourceNotice);
  assert.doesNotMatch(f.calls.messages[0].content, /Giáo trình NCSF/);
});

test('rejects malformed structure context before model and external search', async () => {
  for (const studyStructureId of [42, {}, 'a'.repeat(151)]) {
    const f = fixture();
    assert.equal((await f.post(body({ studyStructureId }))).response.status, 400);
    assert.equal(f.calls.public.length, 0);
    assert.equal(f.calls.messages.length, 0);
  }
});
