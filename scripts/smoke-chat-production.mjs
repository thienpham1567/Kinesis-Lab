// Explicit live smoke test: makes three paid, synthetic chat requests. No client IDs.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const origin = process.argv.find(arg => arg.startsWith('--url='))?.slice(6);
assert.ok(origin && /^https?:\/\//.test(origin), 'Provide --url=https://your-deployment');
const registry = JSON.parse(readFileSync('src/lib/knowledge/corpus.json'));
const cases = [
  { id: 'who-activity', doi: '10.1136/bjsports-2020-102955',
    question: 'Theo WHO 2020, người trưởng thành khỏe mạnh nên vận động mỗi tuần như thế nào? Trả lời ngắn, nêu phạm vi và dẫn nguồn trong ngữ cảnh.' },
  { id: 'low-back-pain', doi: '10.1007/s10926-023-10124-4',
    question: 'Tổng quan phục vụ guideline WHO nói gì về lợi ích và giới hạn bằng chứng của bài tập cho đau thắt lưng mạn nguyên phát ở người lớn? Tóm tắt ngắn và dẫn nguồn, không lập phác đồ cá nhân.' },
  { id: 'lateral-raise', doi: '10.3389/fphys.2025.1611468',
    question: 'Nghiên cứu dumbbell và cable lateral raise cho cơ vai giữa cho phép kết luận gì về tăng độ dày cơ? Có chứng minh hai dụng cụ tương đương không? Trả lời ngắn và dẫn nguồn.' },
];
const results = [];
for (const c of cases) {
  const started = Date.now();
  const response = await fetch(new URL('/api/chat', origin), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: c.question }] }),
    signal: AbortSignal.timeout(90000),
  });
  assert.equal(response.status, 200, c.id);
  const events = (await response.text()).trim().split('\n').map(JSON.parse);
  assert.ok(!events.some(e => e.type === 'warning'), `${c.id}: ${JSON.stringify(events.find(e => e.type === 'warning'))}`);
  assert.ok(!events.some(e => e.type === 'error'), `${c.id}: ${JSON.stringify(events.find(e => e.type === 'error'))}`);
  assert.equal(events.at(-1).type, 'done', c.id);
  const meta = events.find(e => e.type === 'meta');
  assert.equal(meta.model, 'google/gemini-3.8-flash');
  assert.equal(meta.sourceStatus.rag.status, 'ready');
  assert.equal(meta.sourceStatus.rag.model, 'google/gemini-embedding-2');
  assert.equal(meta.sourceStatus.rag.dimensions, 1536);
  assert.equal(meta.sourceStatus.rag.documents, registry.sources.length);
  assert.ok(meta.rag.some(h => h.doi === c.doi), `${c.id}: expected source missing`);
  for (const hit of meta.rag) {
    const source = registry.sources.find(s => s.documentId === hit.document_id);
    assert.ok(source);
    assert.equal(hit.url, source.canonicalUrl);
    assert.equal(hit.license, source.license);
    assert.ok(hit.chapter && hit.checkedAt && hit.authors?.length);
  }
  const answer = events.filter(e => e.type === 'token').map(e => e.text).join('');
  const ragCitations = [...answer.matchAll(/\bRAG:([0-9a-f-]{36})\b/gi)].map(m => m[1]);
  assert.ok(ragCitations.length, `${c.id}: no explicit RAG citation`);
  assert.ok(ragCitations.every(id => meta.rag.some(h => h.id === id)), `${c.id}: unknown RAG citation`);
  results.push({ id: c.id, question: c.question, elapsedMs: Date.now() - started, meta, answer, complete: true });
  console.log(JSON.stringify({ case: c.id, elapsedMs: results.at(-1).elapsedMs, chatModel: meta.model,
    retrieval: meta.sourceStatus.rag, retrievedDois: [...new Set(meta.rag.map(h => h.doi))], citations: ragCitations, complete: true }));
}
mkdirSync('.data/evidence-corpus', { recursive: true });
writeFileSync('.data/evidence-corpus/production-smoke.json', JSON.stringify({ checkedAt: new Date().toISOString(), origin,
  containsClientData: false, note: 'Technical smoke test and finite source checks; not clinical validation.', results }, null, 2));
