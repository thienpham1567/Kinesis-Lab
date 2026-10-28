import assert from "node:assert/strict";
import test from "node:test";
import { figureObjectKey, parseNcsfQuiz, questionErrors, serveNcsfFigure, pageCorrections } from "../src/lib/ncsf-quiz.ts";
import { localNcsfDataEnabled } from "../src/lib/ncsf-local.ts";
import * as quizPolicy from "../src/lib/ncsf-quiz.ts";

const question = () => ({
  q: "Chọn diễn giải phù hợp.", options: ["Một", "Hai", "Ba", "Bốn"], answer: 1,
  explain: "Giải thích có nguồn.", page: 1, evidence: "Dẫn chứng.", obj: ["O1.001"],
  kind: "scenario", domain: "health-fitness",
});
const reference = () => ({ title: "Nguồn", url: "https://www.ncsf.org/certification-exam/content", checkedAt: "2026-10-27", scope: "full-text" });

test("question order changes without losing, duplicating or detaching scored questions", () => {
  assert.equal(typeof quizPolicy.shuffleNcsfQuestionIndices, "function");
  const questions = Array.from({ length: 12 }, (_, i) => ({ ...question(), q: `Question ${i}`, answer: i % 4, page: i + 1 }));
  const original = structuredClone(questions);
  const first = quizPolicy.shuffleNcsfQuestionIndices(questions.length, () => 0);
  const second = quizPolicy.shuffleNcsfQuestionIndices(questions.length, () => 0.9);
  assert.notDeepEqual(first, second);
  for (const order of [first, second]) {
    assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i));
    const filtered = order.filter(i => i % 3 === 0);
    assert.equal(new Set(filtered).size, 4);
    for (const i of order) {
      assert.equal(questions[i].answer, original[i].answer);
      assert.equal(questions[i].page, original[i].page);
    }
  }
  assert.deepEqual(questions, original);
  assert.deepEqual(quizPolicy.shuffleNcsfQuestionIndices(0), []);
  assert.deepEqual(quizPolicy.shuffleNcsfQuestionIndices(1), [0]);
});

test("private local authoring data is opt-in and never active in production", () => {
  assert.equal(localNcsfDataEnabled({ NODE_ENV: "development", NCSF_LOCAL_CONTENT: "1" }), true);
  for (const env of [{}, { NODE_ENV: "development" }, { NODE_ENV: "test", NCSF_LOCAL_CONTENT: "1" }, { NODE_ENV: "production", NCSF_LOCAL_CONTENT: "1" }])
    assert.equal(localNcsfDataEnabled(env), false);
});

test("figure keys accept only bounded chapter/page values and never arbitrary storage paths", () => {
  assert.equal(figureObjectKey("2", "73"), "figures/ch2-p73.png");
  assert.equal(figureObjectKey(8, 32), "figures/ch8-p32.png");
  for (const [ch, p] of [[0, 1], [9, 1], [1, 49], [8, 33], [2, 0], [2, -1], [2, 1.5], ["2/../", 1], [2, "01"], [2, "1e1"], [2, "1/../../quiz.json"], [null, 1]]) {
    assert.equal(figureObjectKey(ch, p), null, JSON.stringify([ch, p]));
  }
});

test("corrected and supplementary questions require traceable safe sources", () => {
  assert.deepEqual(questionErrors(question(), 1), []);
  assert.ok(questionErrors({ ...question(), correction: "Đính chính cụ thể." }, 1).length);
  assert.deepEqual(questionErrors({ ...question(), correction: "Đối chiếu bảng hình với phần chữ ở trang được dẫn.", correctionBasis: "textbook" }, 1), []);
  assert.ok(questionErrors({ ...question(), correctionBasis: "textbook" }, 1).length);
  assert.ok(questionErrors({ ...question(), correction: "Đính chính.", correctionBasis: "invented" }, 1).length);
  const corrected = { ...question(), correction: "Đính chính cụ thể.", references: [reference()] };
  assert.deepEqual(questionErrors(corrected, 1), []);
  assert.ok(questionErrors({ ...corrected, references: [{ ...reference(), url: "javascript:alert(1)" }] }, 1).length);
  assert.ok(questionErrors({ ...corrected, references: [{ ...reference(), url: "https://name:secret@example.com" }] }, 1).length);
  assert.ok(questionErrors({ ...corrected, references: [{ ...reference(), checkedAt: "2026-02-31" }] }, 1).length);
  assert.ok(questionErrors({ ...corrected, references: [{ ...reference(), scope: "expert-approved" }] }, 1).length);
  assert.ok(questionErrors({ ...question(), basis: "supplement" }, 1).length);
  assert.deepEqual(questionErrors({ ...question(), basis: "supplement", references: [reference()] }, 1), []);
});

test("malformed options, keys and figure pages cannot become scored questions", () => {
  assert.ok(questionErrors({ ...question(), page: "1" }, 1).length);
  assert.ok(questionErrors({ ...question(), figure: { page: "2", alt: "Hình" } }, 1).length);
  for (const invalid of [null, {}, { ...question(), options: ["one"] }, { ...question(), options: ["One", " one ", "Two", "Three"] }, { ...question(), answer: 4 }, { ...question(), page: 0 }, { ...question(), figure: { page: 49, alt: "Hình" } }, { ...question(), figure: { page: 2, alt: "" } }, { ...question(), kind: "clinical-diagnosis" }]) {
    assert.ok(questionErrors(invalid, 1).length, JSON.stringify(invalid));
  }
  assert.deepEqual(questionErrors({ ...question(), figure: { page: 2, alt: "Biểu đồ nguồn cần quan sát" } }, 1), []);
});

test("quiz parser accepts all eight chapters and rejects missing or duplicate chapters", () => {
  const bank = { chapters: Array.from({ length: 8 }, (_, i) => ({ ch: i + 1, questions: [question()] })) };
  assert.ok(parseNcsfQuiz(bank));
  assert.equal(parseNcsfQuiz({ chapters: bank.chapters.slice(1) }), null);
  assert.equal(parseNcsfQuiz({ chapters: [...bank.chapters.slice(0, 7), bank.chapters[0]] }), null);
  assert.equal(parseNcsfQuiz({ chapters: bank.chapters.map(c => c.ch === 2 ? { ...c, questions: [{ ...question(), answer: -1 }] } : c) }), null);
  assert.equal(parseNcsfQuiz(null), null);
});

test("reader corrections follow the cited chapter/page and keep actual source scopes", () => {
  const corrected = { ...question(), page: 2, correction: "Đính chính cho trang 2.", references: [reference()] };
  const bank = { chapters: [{ ch: 1, questions: [corrected, { ...corrected }, { ...question(), page: 3, correction: "Trang khác.", references: [reference()] }] }, { ch: 2, questions: [corrected] }] };
  assert.equal(pageCorrections(bank, 1, 2).length, 1);
  assert.equal(pageCorrections(bank, 1, 2)[0].references[0].scope, "full-text");
  assert.deepEqual(pageCorrections(bank, 1, 1), []);
  assert.deepEqual(pageCorrections(bank, 3, 2), []);
});

test("figure requests authenticate before reading storage and send no publicly cacheable content", async () => {
  let reads = 0;
  const download = async key => {
    reads++;
    assert.equal(key, "figures/ch2-p73.png");
    return { data: new Blob([new Uint8Array([137, 80, 78, 71])]), error: null };
  };
  const request = new Request("https://example.com/api/ncsf/figure?chapter=2&page=73");
  const denied = await serveNcsfFigure(request, { isAuthed: async () => false, download });
  assert.equal(denied.status, 401);
  assert.equal(reads, 0);
  const invalid = await serveNcsfFigure(new Request("https://example.com/api/ncsf/figure?chapter=2&page=999"), { isAuthed: async () => true, download });
  assert.equal(invalid.status, 404);
  assert.equal(reads, 0);
  const allowed = await serveNcsfFigure(request, { isAuthed: async () => true, download });
  assert.equal(allowed.status, 200);
  assert.equal(reads, 1);
  assert.equal(allowed.headers.get("Content-Type"), "image/png");
  assert.equal(allowed.headers.get("Cache-Control"), "private, no-store");
  assert.equal(allowed.headers.get("Vary"), "Cookie");
  assert.equal(allowed.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal((await allowed.arrayBuffer()).byteLength, 4);
});

test("missing or unavailable figures fail without leaking storage errors", async () => {
  const request = new Request("https://example.com/api/ncsf/figure?chapter=2&page=73");
  const missing = await serveNcsfFigure(request, { isAuthed: async () => true, download: async () => ({ data: null, error: { message: "private storage detail" } }) });
  assert.equal(missing.status, 404);
  assert.doesNotMatch(await missing.text(), /private storage/);
  const unavailable = await serveNcsfFigure(request, { isAuthed: async () => true, download: async () => { throw new Error("private credential detail"); } });
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /credential/);
});
