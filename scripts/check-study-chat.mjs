import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { createAppLoader } from './lib/load-app-module.mjs';
const load = createAppLoader({ globals: { crypto } });
const moduleAt = path => { assert.ok(existsSync(path), `${path} must implement the approved study-chat behavior`); return load(path); };
const message = (id, role, content) => ({ id, role, content, attachments: [], sources: [] });
const assistant = message('00000000-0000-4000-8000-000000000002', 'assistant', 'Cơ delta giúp vận động vai.');
const user = message('00000000-0000-4000-8000-000000000001', 'user', 'Giải thích cơ delta');
const context = { structureId: 'za-selected', name: 'Cơ delta', english: 'Deltoid', side: 'right', area: 'upper', groupId: 'deltoids' };
const meta = { context, sources: [{ id: 'PMID:123', title: 'Anatomy', url: 'https://pubmed.ncbi.nlm.nih.gov/123/', checkedAt: '2026-10-29', access: 'Metadata và abstract' }], actions: [{ label: 'Xem trên 3D', href: '/atlas?tab=3d&area=upper&structure=za-selected' }] };

test('scroll follows only when reader stays near the bottom', () => {
  const { isNearStudyBottom } = moduleAt('src/lib/chat/study-scroll.ts');
  assert.equal(isNearStudyBottom({ scrollHeight: 2000, clientHeight: 400, scrollTop: 1590 }), true);
  assert.equal(isNearStudyBottom({ scrollHeight: 2000, clientHeight: 400, scrollTop: 400 }), false);
  assert.equal(isNearStudyBottom({ scrollHeight: 200, clientHeight: 400, scrollTop: 0 }), true);
});
test('source/context/actions survive library round trip and Vietnamese search', () => {
  const lib = moduleAt('src/lib/chat/study-library.ts');
  let state = lib.parseStudyLibrary(null);
  state = lib.rememberStudyConversation(state, { id: 'conversation-1', messages: [user, { ...assistant, study: meta }] }, '2026-10-29T04:00:00Z');
  state = lib.toggleStudyBookmark(state, { id: 'conversation-1:answer-1', question: user.content, answer: { ...assistant, study: meta }, savedAt: '2026-10-29T04:01:00Z' });
  const restored = lib.parseStudyLibrary(JSON.stringify(state));
  assert.equal(restored.conversations.length, 1);
  assert.equal(restored.saved.length, 1);
  assert.equal(restored.saved[0].answer.study.sources[0].url, meta.sources[0].url);
  assert.equal(restored.saved[0].answer.study.actions[0].href, meta.actions[0].href);
  assert.equal(restored.saved[0].answer.study.context.side, 'right');
  assert.equal(lib.searchStudyBookmarks(restored, 'co delta')[0].question, user.content);
  assert.equal(lib.searchStudyConversations(restored, 'VẬN ĐỘNG VAI').length, 1);
  assert.equal(lib.searchStudyBookmarks(restored, 'unknown').length, 0);
  assert.equal(lib.toggleStudyBookmark(restored, restored.saved[0]).saved.length, 0);
});
test('library validates untrusted storage and caps history without losing bookmarks', () => {
  const lib = moduleAt('src/lib/chat/study-library.ts');
  assert.equal(lib.parseStudyLibrary('{broken').saved.length, 0);
  const dirty = lib.parseStudyLibrary(JSON.stringify({ version: 1, saved: [{ id: 'bad', question: 'test', answer: { ...assistant, study: { ...meta, actions: [{ label: 'evil', href: '//evil.test' }], sources: [{ ...meta.sources[0], url: 'javascript:alert(1)' }] } }, savedAt: '2026-10-29' }], conversations: [] }));
  assert.equal(dirty.saved[0].answer.study.actions.length, 0);
  assert.equal(dirty.saved[0].answer.study.sources.length, 0);
  let state = lib.parseStudyLibrary(null);
  for (let i = 0; i < 40; i++) state = lib.rememberStudyConversation(state, { id: `conversation-${i}`, messages: [user, assistant] }, '2026-10-29T04:00:00Z');
  assert.ok(state.conversations.length <= 30);
  assert.equal(state.conversations[0].id, 'conversation-39');
});
test('Atlas context is published, replaced and cleared without stale selections', () => {
  const ctx = moduleAt('src/lib/chat/study-context.ts');
  let calls = 0;
  const unsubscribe = ctx.subscribeStudyContext(() => calls++);
  ctx.publishStudyContext(context);
  assert.equal(ctx.getStudyContext().structureId, context.structureId);
  assert.match(ctx.studyContextLabel(context), /Phải/);
  const questions = ctx.studyQuestions(context);
  assert.ok(questions.length >= 3);
  assert.ok(questions.every(q => q.prompt.includes('nguồn') && q.prompt.includes('Deltoid')));
  ctx.publishStudyContext(null);
  assert.equal(ctx.getStudyContext(), null);
  assert.equal(calls, 2);
  unsubscribe();
});

test('storage pressure evicts old history while preserving saved knowledge and newest conversation', () => {
  const { fitStudyLibrary, parseStudyLibrary } = moduleAt('src/lib/chat/study-library.ts');
  const state = { ...parseStudyLibrary(null), saved: [{ id: 'saved', question: 'keep', answer: assistant, savedAt: '2026-10-29' }], conversations: Array.from({ length: 10 }, (_, i) => ({ id: `c-${i}`, title: 'history', updatedAt: '2026-10-29', messages: [{ ...assistant, content: 'x'.repeat(10000) }] })) };
  const fitted = fitStudyLibrary(state, 25000);
  assert.ok(JSON.stringify(fitted).length <= 25000);
  assert.equal(fitted.saved[0].id, 'saved');
  assert.equal(fitted.conversations[0].id, 'c-0');
  assert.ok(fitted.conversations.length < 10);
});

test('copy response replaces internal citation identifiers with readable source titles', () => {
  const { studyAnswerClipboard } = moduleAt('src/lib/chat/study-copy.ts');
  const copied = studyAnswerClipboard({ ...assistant, content: 'Đối chiếu [PMID:123].', study: meta });
  assert.ok(copied.includes('Anatomy'));
  assert.ok(copied.includes(meta.sources[0].url));
  assert.ok(!copied.includes('[PMID:123]'));
});

test('copy supports every displayed source-qualifier boundary without misidentifying a prefix', () => {
  const { studyAnswerClipboard } = moduleAt('src/lib/chat/study-copy.ts');
  for (const boundary of [':', ';', ',', ' ']) {
    const copied = studyAnswerClipboard({ ...assistant, content: `[APP:structure:supraspinatus${boundary} nguồn 1]`, citations: [{ id: 'APP:structure:supraspinatus', label: 'Cơ trên gai', sources: [] }] });
    assert.ok(copied.includes('Cơ trên gai'), boundary);
    assert.ok(!copied.includes('chưa đối chiếu'), boundary);
  }
  assert.ok(studyAnswerClipboard({ ...assistant, content: '[APP:structure:supraspinatus-other]', citations: [{ id: 'APP:structure:supraspinatus', label: 'Cơ trên gai', sources: [] }] }).includes('chưa đối chiếu'));
});
