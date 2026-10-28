import assert from "node:assert/strict";
import test from "node:test";
import { buildNcsfCoverage } from "./lib/ncsf-coverage.mjs";

const objectives = [{ id: "O1.001", ch: 1, text: "Nhiều kỹ năng" }, { id: "O2.002", ch: 2, text: "Một kỹ năng" }];
const exams = [new Set(["1"]), new Set(["2"])];

test("references are separated by chapter and never promoted to complete coverage", () => {
  const result = buildNcsfCoverage(objectives, { "O1.001": ["ch2#1", "E1-1"] }, [{ ch: 1, questions: [{ obj: ["O2.002"] }] }, { ch: 2, questions: [{}] }], exams);
  assert.deepEqual(result.rows[0].own, []);
  assert.deepEqual(result.rows[0].other, ["ch2#1"]);
  assert.equal(result.rows[0].status, "partial");
  assert.equal(result.totals.own, 0);
  assert.equal(result.totals.crossOnly, 2);
  assert.equal(result.totals.anyApp, 2);
});

test("direct tags and map references deduplicate; source gaps remain explicit", () => {
  const result = buildNcsfCoverage(objectives, { "O1.001": ["ch1#1"], "O2.002": "none: chưa có nội dung" }, [{ ch: 1, questions: [{ obj: ["O1.001"] }] }], exams,
    [{ id: "O1.001", status: "sampled", note: "Chỉ một phần nhỏ được hỏi." }, { id: "O2.002", status: "source-gap", note: "Cần nguồn cho kỹ thuật." }]);
  assert.deepEqual(result.rows[0].own, ["ch1#1"]);
  assert.equal(result.rows[0].status, "sampled");
  assert.equal(result.rows[1].status, "source-gap");
  assert.equal(result.totals.noApp, 1);
});

test("broken/zero references, unknown objectives and duplicate status notes cannot pass silently", () => {
  for (const ref of ["ch1#0", "ch1#2", "ch0#1", "E1-0", "E2-1"])
    assert.throws(() => buildNcsfCoverage(objectives, { "O1.001": [ref] }, [{ ch: 1, questions: [{}] }], exams));
  assert.throws(() => buildNcsfCoverage(objectives, {}, [{ ch: 1, questions: [{ obj: ["O1.999"] }] }], exams));
  assert.throws(() => buildNcsfCoverage(objectives, { "O1.999": [] }, [], exams));
  assert.throws(() => buildNcsfCoverage(objectives, {}, [], exams, [{ id: "O1.001", status: "complete", note: "auto" }]));
  assert.throws(() => buildNcsfCoverage(objectives, {}, [], exams, [{ id: "O1.001", status: "partial", note: "one" }, { id: "O1.001", status: "partial", note: "two" }]));
});
