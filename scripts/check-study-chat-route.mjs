import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAppLoader } from './lib/load-app-module.mjs';
import * as anatomyEvidence from '../src/lib/clinical/anatomy-evidence.mjs';
import * as catalogCorrections from '../src/lib/clinical/atlas-catalog-corrections.mjs';

const selectedId = 'za-dfbfb9194982';
function fixture({ papers = [], ragHits = [], literatureError = false } = {}) {
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
        retrieveKnowledge: async query => { calls.rag.push(query); return { hits: ragHits, retrieval: { status: ragHits.length ? 'ready' : 'empty', message: 'registered research corpus only' } }; },
        formatRag: hits => hits.map(h => `[RAG:${h.citationId ?? h.id}] ${h.title}\n${h.url}\n${h.content}`).join('\n'),
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

test('study follow-up anchors current muscle and side and excludes old topic from retrieval', async () => {
  const f = fixture();
  const { events } = await f.post(body({ messages: [
    { role: 'user', content: 'PRIVATE_PERSON old gastrocnemius insulin result 123' },
    { role: 'assistant', content: 'previous answer' },
    { role: 'user', content: 'Chức năng chính?' },
  ] }));
  assert.equal(f.calls.rag.length, 1, 'widget calls registered research corpus');
  assert.doesNotMatch(f.calls.rag[0], /PRIVATE|gastrocnemius|123/);
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
  const system = f.calls.messages[0].content;
  // Model guidance goes to the prompt only; readers see retrieval problems, not instructions.
  assert.match(system, /HƯỚNG DẪN DÙNG NGUỒN[^\n]*\n[^\n]*cơ mẹ/);
  assert.doesNotMatch(meta.sourceNotice ?? '', /cơ mẹ|Chỉ tổng hợp|mesh/);
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
  const beforeStandalone = f.calls.rag.length;
  const standalone = await f.post({ messages: [{ role: 'user', content: 'hello' }], studyStructureId: selectedId });
  assert.ok(!standalone.events.some(e => e.type === 'study-meta'));
  assert.equal(f.calls.rag.length, beforeStandalone + 1);
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

test('study mode on any page uses registered research corpus and exposes failed public retrieval honestly', async () => {
  const f = fixture({ literatureError: true });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined }));
  assert.equal(f.calls.rag.length, 1);
  assert.equal(events.find(e => e.type === 'meta').sourceStatus.rag.status, 'empty');
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

test('study questions retrieve registered research full text and expose its sources', async () => {
  const hit = { id: 'who-chunk', title: 'WHO 2020', document_id: 'registered-doc', doi: '10.1136/bjsports-2020-102955', url: 'https://doi.org/10.1136/bjsports-2020-102955', content: 'Supplied full-text passage', chapter: 'Recommendations', checkedAt: '2026-10-26', access: 'Licensed text', score: 0.9 };
  const f = fixture({ ragHits: [hit] });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Theo WHO 2020 nên vận động aerobic bao nhiêu mỗi tuần?' }] }));
  assert.equal(f.calls.rag.length, 1);
  assert.match(f.calls.public[0], /physical.*activity/i);
  assert.equal(f.calls.publicOptions.queryMode, 'trusted');
  assert.equal(events.find(e => e.type === 'meta').sourceStatus.rag.status, 'ready');
  assert.ok(events.find(e => e.type === 'study-meta').sources.some(source => source.id === 'RAG:who-chunk' && source.checkedAt === hit.checkedAt));
  assert.match(f.calls.messages[0].content, /Supplied full-text passage/);
});

test('study EMG question is not misclassified as medication safety by the word đúng', async () => {
  const f = fixture();
  await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Hip thrust có EMG cao hơn squat thì chắc chắn tăng cơ hơn đúng không?' }] }));
  assert.match(f.calls.public[0], /electromyography/);
  assert.doesNotMatch(f.calls.public[0], /medication|safety/);
});

test('Vietnamese diabetes and aerobic topics work without English medication names', async () => {
  const f = fixture();
  await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Đái tháo đường típ 2 và tập luyện có gây hạ đường huyết không? PRIVATE_PERSON_123' }] }));
  assert.match(f.calls.public[0], /diabetes/);
  assert.doesNotMatch(f.calls.public[0], /PRIVATE|123|Đái/);
});

test('study full-text relevance excludes lateral deltoid research for a metformin question', async () => {
  const f = fixture({ ragHits: [{ id: 'unrelated', document_id: 'registered-doc', title: 'Lateral raises', doi: '10.3389/fphys.2025.1611468', url: 'https://doi.org/10.3389/fphys.2025.1611468', content: 'Shoulder hypertrophy results', score: 0.7 }] });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Metformin và insulin khác nhau thế nào?' }] }));
  assert.equal(events.find(e => e.type === 'meta').rag.length, 0);
  assert.equal(events.find(e => e.type === 'meta').sourceStatus.rag.status, 'no_matches');
  assert.doesNotMatch(f.calls.messages[0].content, /Shoulder hypertrophy results/);
});

test('study EMG public evidence excludes unrelated bruxism and retains the actual methodological paper', async () => {
  const paper = (pmid, title, abstract) => ({ pmid, title, abstract, year: '2022', authors: '', journal: '', url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });
  const f = fixture({ papers: [
    paper('35006527', 'Surface EMG amplitude is not a validated predictor of muscle hypertrophy', 'Studies of resistance training and exercise.'),
    paper('39670031', 'Sleep bruxism validity', 'Electromyography for masseter hypertrophy during sleep.'),
  ] });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'EMG cao hơn có dự đoán tăng cơ từ tập luyện không?' }] }));
  assert.deepEqual(events.find(e => e.type === 'meta').pubmed.map(p => p.pmid), ['35006527']);
});

test('EMG sources follow the current body part rather than defaulting to hip thrust', async () => {
  const f = fixture();
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'EMG của cơ vai có dự đoán tăng cơ không?' }] }));
  assert.ok(!events.find(e => e.type === 'meta').curated.some(record => record.id === 'exercise:barbell-hip-thrust'));
});

test('a type 1 diabetes question does not silently select a type 2-only search', async () => {
  const f = fixture();
  await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Đái tháo đường típ 1 dùng insulin khi tập cần chú ý gì?' }] }));
  assert.doesNotMatch(f.calls.public[0], /type 2 diabetes/);
});

test('explicit comparison of two muscles replaces unrelated WHO retrieval history', async () => {
  const f = fixture();
  await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined, messages: [
    { role: 'user', content: 'WHO 2020 aerobic physical activity' },
    { role: 'assistant', content: 'Prior topic.' },
    { role: 'user', content: 'Cơ trên gai và cơ dưới gai khác nhau thế nào?' },
  ] }));
  assert.doesNotMatch(f.calls.rag[0], /WHO|aerobic|physical activity/);
});

test('study RAG uses exact short citation aliases while preserving chunk provenance and collision safety', async () => {
  const id = '80cb3e5a-2e62-5540-ada0-0a3d8c3bfc56';
  const hit = { id, document_id: 'who', doi: '10.1136/bjsports-2020-102955', title: 'WHO 2020', chapter: 'Adults', url: 'https://doi.org/10.1136/bjsports-2020-102955', content: 'Supplied passage', score: 0.8, checkedAt: '2026-10-26' };
  const f = fixture({ ragHits: [hit] });
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'WHO 2020 aerobic?' }] }));
  const actual = events.find(e => e.type === 'meta').rag[0];
  assert.equal(actual.id, id);
  assert.equal(actual.citationId, '80cb3e5a2e62');
  assert.ok(events.find(e => e.type === 'study-meta').sources.some(s => s.id === 'RAG:80cb3e5a2e62'));
  const { formatRag } = f.load('src/lib/tools/rag-search.ts');
  assert.match(formatRag([actual]), /\[RAG:80cb3e5a2e62\]/);
  assert.doesNotMatch(formatRag([actual]), new RegExp(id));
  const { filterStudyKnowledge } = f.load('src/lib/chat/study-retrieval.ts');
  const colliding = filterStudyKnowledge('WHO 2020 aerobic', [hit, { ...hit, id: '80cb3e5a-2e62-5540-ada0-0a3d8c3bfc57' }]);
  assert.equal(new Set(colliding.map(h => h.citationId)).size, 2);
  const { auditAnswerCitations } = f.load('src/lib/chat/citation-audit.ts');
  assert.equal(auditAnswerCitations('[RAG:80cb3e5a2e62]', { rag: [actual], pubmed: [], curated: [] }).unsupportedReferences.length, 0);
  assert.equal(auditAnswerCitations('[RAG:80cb3e5a2e63]', { rag: [actual], pubmed: [], curated: [] }).unsupportedReferences.length, 1);
});

test('focused learning questions do not fill the source list with neighboring ROM and exercise records', async () => {
  const f = fixture();
  const { events } = await f.post(body({ studyPage: '/knowledge', studyStructureId: undefined,
    messages: [{ role: 'user', content: 'Hip thrust có EMG cao hơn squat thì chắc chắn tăng cơ mông nhiều hơn đúng không?' }] }));
  const records = events.find(e => e.type === 'meta').curated;
  assert.ok(records.some(record => record.id === 'exercise:barbell-hip-thrust'));
  assert.ok(records.length <= 2);
  assert.ok(!records.some(record => record.domain === 'rom'));
});

test('question names its own subject: suggestions, label and search follow the question, not the Atlas selection', async () => {
  const acl = 'za-aee00ebd66d4';
  const ask = async content => {
    const f = fixture();
    const { events } = await f.post(body({ studyStructureId: acl, messages: [{ role: 'user', content }] }));
    return { meta: events.find(e => e.type === 'study-meta'), f };
  };
  // Muscle group named while ACL is selected.
  const quads = await ask('Cơ nào trong nhóm quadriceps vừa duỗi gối vừa gập hông?');
  assert.equal(quads.meta.context, null);
  assert.deepEqual(quads.meta.actions.map(a => a.href), ['/atlas?tab=hypertrophy&muscle=quads_adductors']);
  assert.ok(!quads.f.calls.public.some(q => /cruciate/i.test(q)), 'PubMed must not search the stale selection');
  // Another structure named: its own view links, not the selection.
  const rf = await ask('Chức năng của rectus femoris?');
  assert.ok(rf.meta.actions.length && rf.meta.actions.every(a => !a.href.includes(acl)));
  assert.ok(rf.meta.actions[0].href.includes('tab=3d'));
  // Specific exercise names link to the exercise.
  const rdl = await ask('Hamstrings và Romanian Deadlift');
  assert.ok(rdl.meta.actions.some(a => a.href === '/atlas?tab=hypertrophy&exercise=romanian-deadlift-seated-curl'));
  // Head names that are ambiguous structures still resolve to their group.
  assert.deepEqual((await ask('Biceps femoris thuộc nhóm nào?')).meta.actions.map(a => a.href), ['/atlas?tab=hypertrophy&muscle=hamstrings']);
  // Implicit and "this structure" questions keep the selection.
  for (const content of ['Chức năng chính?', 'Dây chằng này liên quan gì tới quadriceps?', 'So sánh squat và deadlift', 'So sánh với rectus femoris', 'Khớp gối chịu lực thế nào?']) {
    const kept = await ask(content);
    assert.equal(kept.meta.context?.structureId, acl, content);
    assert.ok(kept.meta.actions[0].href.includes(acl), content);
  }
  // Accent-free "cơ thẳng đùi" must not read as trapezius ("cơ thang").
  assert.ok(!(await ask('Cơ thẳng đùi làm gì?')).meta.actions.some(a => a.href.includes('upper_back_traps')));
});
