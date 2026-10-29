import assert from "node:assert/strict";
import test from "node:test";
import {
  parseNcsfMockExams,
  mockImageKey,
  serveNcsfMockAsset,
  mockAnsweredCount,
} from "../src/lib/ncsf-mock-exams.ts";
const bank = () => ({
  version: 1,
  checkedAt: "2026-10-29",
  exams: [1, 2].map((id) => ({
    id,
    questions: Array.from({ length: 150 }, (_, i) => ({
      position: i + 1,
      title: `Câu ${i === 149 ? 149 : i + 1}: Ví dụ`,
      options:
        i === 123
          ? ["A. Một", "B. Hai", "C. Ba"]
          : ["A. Một", "B. Hai", "C. Ba", "D. Bốn"],
      images:
        i === 4 && id === 1
          ? [{ index: 1, width: 200, height: 300, alt: "Hình nguồn" }]
          : [],
    })),
  })),
});
test("two complete source-ordered exams preserve duplicate printed labels and three options", () => {
  const b = bank();
  const original = structuredClone(b);
  assert.deepEqual(parseNcsfMockExams(b), b);
  assert.deepEqual(b, original);
  assert.equal(b.exams[1].questions[123].options.length, 3);
  for (const mutate of [
    (b) => b.exams.pop(),
    (b) => b.exams[0].questions.pop(),
    (b) => (b.exams[1].id = 1),
    (b) => (b.exams[0].questions[2].position = 1),
    (b) => (b.exams[0].questions[0].options = ["only one"]),
    (b) => (b.exams[0].questions[0].answer = 0),
    (b) =>
      (b.exams[0].questions[0].images = [
        { index: 1, width: 0, height: 20, alt: "" },
      ]),
    (b) => (b.exams[0].questions[0].url = "https://private.example"),
    (b) => (b.checkedAt = "2026-02-31"),
  ]) {
    const invalid = bank();
    mutate(invalid);
    assert.equal(parseNcsfMockExams(invalid), null);
  }
  assert.equal(parseNcsfMockExams(null), null);
});
test("image object key cannot traverse paths or exceed fixed exam/question bounds", () => {
  assert.equal(mockImageKey("1", "150", "1"), "mock-exams/e1-q150-i1.png");
  for (const args of [
    [3, 1, 1],
    [1, 151, 1],
    [0, 1, 1],
    [1, "01", 1],
    [1, "1/../", 1],
    [1, 1, 0],
    [1, 1, 5],
    [1, NaN, 1],
  ])
    assert.equal(mockImageKey(...args), null);
});
test("answered counts include only valid choices in that exam", () => {
  const e = bank().exams[1];
  assert.equal(
    mockAnsweredCount(e, { 0: 1, 123: 3, 149: 0, 150: 1, 4: -1, 5: NaN }),
    2,
  );
});
test("assets require auth before reads, keep cache private, validate data and hide errors", async () => {
  let reads = 0;
  const download = async (key) => {
    reads++;
    assert.equal(key, "mock-exams/e1-q72-i1.png");
    return {
      data: new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])]),
      error: null,
    };
  };
  const image = new Request(
    "https://example.com/api/ncsf/mock-image?exam=1&question=72&image=1",
  );
  assert.equal(
    (
      await serveNcsfMockAsset("image", image, {
        isAuthed: async () => false,
        download,
      })
    ).status,
    401,
  );
  assert.equal(reads, 0);
  assert.equal(
    (
      await serveNcsfMockAsset(
        "image",
        new Request("https://example.com/?exam=1&question=151&image=1"),
        { isAuthed: async () => true, download },
      )
    ).status,
    404,
  );
  assert.equal(reads, 0);
  const r = await serveNcsfMockAsset("image", image, {
    isAuthed: async () => true,
    download,
  });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Cache-Control"), "private, no-store");
  assert.equal(r.headers.get("Vary"), "Cookie");
  assert.equal(r.headers.get("Content-Type"), "image/png");
  assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
  const req = new Request("https://example.com/api/ncsf/mock-exams");
  const good = await serveNcsfMockAsset("bank", req, {
    isAuthed: async () => true,
    download: async () => ({
      data: new Blob([JSON.stringify(bank())]),
      error: null,
    }),
  });
  assert.equal(good.status, 200);
  assert.equal((await good.json()).exams.length, 2);
  const bad = await serveNcsfMockAsset("bank", req, {
    isAuthed: async () => true,
    download: async () => ({ data: new Blob(["{}"]), error: null }),
  });
  assert.equal(bad.status, 503);
  const failed = await serveNcsfMockAsset("bank", req, {
    isAuthed: async () => true,
    download: async () => {
      throw Error("credential detail");
    },
  });
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /credential/);
});

test("shuffle preserves every source question, choice and image without changing the bank", async () => {
  const helpers = await import("../src/lib/ncsf-mock-exams.ts");
  assert.equal(typeof helpers.shuffleMockExam, "function");
  const exam = bank().exams[0];
  const original = structuredClone(exam);
  const first = helpers.shuffleMockExam(exam, undefined, () => 0.25);
  const previous = structuredClone(first);
  const next = helpers.shuffleMockExam(exam, first, () => 0.25);
  assert.notDeepEqual(next.questions, first.questions);
  for (let i = 0; i < 150; i++) assert.notDeepEqual(next.options[i], first.options[i]);
  for (const order of [first, next]) {
    assert.deepEqual(
      [...order.questions].sort((a, b) => a - b),
      Array.from({ length: 150 }, (_, i) => i),
    );
    assert.equal(order.options.length, 150);
    for (const sourceIndex of order.questions) {
      const source = exam.questions[sourceIndex];
      assert.deepEqual(
        [...order.options[sourceIndex]].sort((a, b) => a - b),
        source.options.map((_, i) => i),
      );
      const selected = 1;
      const displayedSelection = order.options[sourceIndex].indexOf(selected);
      assert.equal(
        source.options[order.options[sourceIndex][displayedSelection]],
        original.questions[sourceIndex].options[selected],
      );
      assert.deepEqual(source.images, original.questions[sourceIndex].images);
    }
    assert.equal(order.options[123].length, 3);
  }
  assert.deepEqual(exam, original);
  assert.deepEqual(first, previous);
});
test("shuffled labels renumber only prefixes and preserve the source text body", async () => {
  const helpers = await import("../src/lib/ncsf-mock-exams.ts");
  assert.equal(typeof helpers.mockQuestionText, "function");
  assert.equal(typeof helpers.mockOptionText, "function");
  assert.equal(
    helpers.mockQuestionText("Câu 150: Nội dung câu hỏi\nDòng hai"),
    "Nội dung câu hỏi\nDòng hai",
  );
  assert.equal(
    helpers.mockOptionText("C. Nội dung lựa chọn A và cơ B"),
    "Nội dung lựa chọn A và cơ B",
  );
  assert.equal(helpers.mockOptionText("Không có nhãn"), "Không có nhãn");
});
