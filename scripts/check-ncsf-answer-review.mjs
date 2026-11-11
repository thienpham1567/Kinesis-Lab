// Schema, storage-key and route checks for expanded answer feedback. These do not establish
// medical accuracy; the reasons are AI drafts grounded on the quoted textbook page.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as review from "../src/lib/ncsf-answer-review.ts";
import { NCSF_PAGE_COUNTS } from "../src/lib/ncsf-quiz.ts";

const id = (n) => n.toString(16).padStart(64, "0");
const item = () => ({
  slug: "02-giai-phau-chuc-nang",
  page: 4,
  section: "Sự Phát Triển Của Xương (Bone Growth)",
  passage: ["● Tấm sụn đầu xương chịu trách nhiệm cho sự tăng trưởng theo chiều dọc."],
  concept: "Tấm sụn tăng trưởng quyết định chiều dài xương khi còn phát triển.",
  whyCorrect: "Giáo trình mô tả tấm sụn đầu xương là nơi xương dài tăng trưởng theo chiều dọc.",
  whyWrong: { [id(2)]: "Nối cơ với xương là chức năng của gân, không phải của tấm sụn." },
});
const file = () => ({
  version: 1, bank: "quiz", part: 2, generatedAt: "2026-11-11",
  method: "ai-draft-from-textbook-page", model: "anthropic/claude-haiku-5.5",
  reviewedBy: null, items: { [id(1)]: item() },
});

test("review files validate their schema and keep reviewer metadata truthful", () => {
  assert.deepEqual(review.parseAnswerReviewFile(file(), { bank: "quiz", part: 2 }), file());
  const flagged = file(); flagged.items[id(1)].indirect = true;
  assert.ok(review.parseAnswerReviewFile(flagged, { bank: "quiz", part: 2 }));
  for (const mutate of [
    (f) => { f.reviewedBy = "Chuyên gia"; },
    (f) => { f.method = "expert-reviewed"; },
    (f) => { f.part = 9; },
    (f) => { f.bank = "mock"; },
    (f) => { f.extra = true; },
    (f) => { f.items["not-a-hash"] = item(); },
    (f) => { f.items[id(1)].slug = "09-de-cuong-on-tap"; },
    (f) => { f.items[id(1)].page = 78; },
    (f) => { f.items[id(1)].passage = []; },
    (f) => { f.items[id(1)].passage = Array(7).fill("Dòng"); },
    (f) => { f.items[id(1)].whyCorrect = " "; },
    (f) => { f.items[id(1)].whyWrong = {}; },
    (f) => { f.items[id(1)].whyWrong = { A: "Lý do theo chữ cái" }; },
    (f) => { f.items[id(1)].sourceUrl = "https://example.org"; },
    (f) => { f.items[id(1)].indirect = false; },
  ]) {
    const f = file();
    mutate(f);
    assert.equal(review.parseAnswerReviewFile(f, { bank: "quiz", part: 2 }), null);
  }
  assert.equal(review.parseAnswerReviewFile(file(), { bank: "quiz", part: 3 }), null);
});

test("textbook page limits match the quiz bank", () => {
  assert.deepEqual([...review.NCSF_TEXTBOOK_PAGE_COUNTS], [...NCSF_PAGE_COUNTS]);
});

test("storage keys are fixed per bank and part", () => {
  assert.equal(review.answerReviewKey("quiz", "2"), "review/quiz-ch2.json");
  assert.equal(review.answerReviewKey("mock", 2), "review/mock-2.json");
  for (const [bank, part] of [["quiz", "9"], ["mock", "3"], ["mock", "0"], ["quiz", "../quiz"], ["pdf", "1"], ["quiz", "1.5"]])
    assert.equal(review.answerReviewKey(bank, part), null);
});

test("route requires the NCSF session and never serves unvalidated content", async () => {
  const request = (q) => new Request(`https://lab.local/api/ncsf/review?${q}`);
  const blob = (v) => new Blob([JSON.stringify(v)]);
  const seen = [];
  const deps = (data, authed = true) => ({
    isAuthed: async () => authed,
    download: async (key) => { seen.push(key); return { data, error: data ? null : new Error("missing") }; },
  });
  assert.equal((await review.serveAnswerReview(request("bank=quiz&part=2"), deps(blob(file()), false))).status, 401);
  assert.equal(seen.length, 0);
  const ok = await review.serveAnswerReview(request("bank=quiz&part=2"), deps(blob(file())));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Cache-Control"), "private, no-store");
  assert.deepEqual(await ok.json(), file());
  assert.equal(seen.at(-1), "review/quiz-ch2.json");
  assert.equal((await review.serveAnswerReview(request("bank=quiz&part=3"), deps(blob(file())))).status, 503);
  assert.equal((await review.serveAnswerReview(request("bank=quiz&part=2"), deps(null))).status, 404);
  assert.equal((await review.serveAnswerReview(request("bank=quiz&part=x"), deps(blob(file())))).status, 404);
  assert.equal((await review.serveAnswerReview(request("bank=quiz&part=2"), deps(new Blob(["{"])))).status, 503);
});

test("wrong answers render the expanded review with textbook source and AI disclosure", () => {
  const panel = readFileSync("src/components/NcsfAnswerReview.tsx", "utf8");
  for (const text of ["Vì sao đáp án", "Vì sao lựa chọn", "Điều cần nhớ", "Giáo trình NCSF", "Trang {review.page}", "chưa có chuyên gia duyệt", "review.indirect"])
    assert.ok(panel.includes(text), text);
  assert.match(panel, /outcome === "wrong"[\s\S]*<section/);
  for (const file of ["src/components/NcsfQuiz.tsx", "src/components/NcsfMockExams.tsx"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /useNcsfAnswerReviews\(/, file);
    assert.match(source, /<NcsfAnswerReviewPanel/, file);
  }
  const knowledge = readFileSync("src/app/knowledge/page.tsx", "utf8");
  assert.match(knowledge, /<NcsfMockExams[\s\S]*onOpenPage=\{openCitation\("mock"\)\}/);
  // Returning from a cited page goes back to the practice view that opened it.
  assert.match(knowledge, /setView\(citationFrom\)/);
});
