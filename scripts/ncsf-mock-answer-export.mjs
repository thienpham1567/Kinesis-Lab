// The complete licensed key and authored explanation overrides stay in ignored .data.
// node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/ncsf-mock-answer-export.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseNcsfMockExams } from "../src/lib/ncsf-mock-exams.ts";
import {
  parseMockAnswerKey,
  prepareMockPractice,
} from "../src/lib/ncsf-mock-answers.ts";

export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const sourceFields = (source) => ({
  title: source.title,
  url: source.url,
  locator: source.locator,
  checkedAt: source.checkedAt,
  scope: source.scope,
});

export function exportMockAnswerKey(bankBytes, researchBytes, overrides) {
  const bank = parseNcsfMockExams(JSON.parse(bankBytes));
  const research = JSON.parse(researchBytes);
  assert.ok(bank, "Invalid original mock bank");
  assert.equal(research.version, 2, "Expected researched key version 2");
  assert.equal(research.officialNcsfKey, false, "The key is not official");
  assert.equal(research.reviewedBy, null, "Do not invent professional approval");
  assert.equal(research.sourceBankSha256, sha256(bankBytes));
  assert.equal(overrides.sourceKeySha256, sha256(researchBytes));
  assert.equal(overrides.preparedAt, research.compiledAt);
  assert.equal(research.sourceQuestionCount, 300);
  assert.equal(research.exams.length, 2);
  assert.equal(research.proposedQuestionRevisions.length, 22);
  assert.equal(research.deepResearchCases.length, 20);
  const cases = new Map(research.deepResearchCases.map((item) => [item.id, item]));
  const revisions = new Map(
    research.proposedQuestionRevisions.map((item) => [item.originalId, item]),
  );
  assert.equal(cases.size, 20, "Duplicate research case");
  assert.equal(revisions.size, 22, "Duplicate revised source position");
  assert.ok(
    same(Object.keys(overrides.explanations).sort(), [...cases.keys()].sort()),
    "Every research case needs its own practice-context explanation",
  );
  let clarified = 0;
  let qualified = 0;
  const exams = bank.exams.map((exam, examIndex) => {
    const researchedExam = research.exams[examIndex];
    assert.equal(researchedExam.id, exam.id);
    assert.equal(researchedExam.questions.length, 150);
    const answers = exam.questions.map((question, sourceIndex) => {
      const row = researchedExam.questions[sourceIndex];
      const id = `E${exam.id}-Q${String(question.position).padStart(3, "0")}`;
      assert.equal(row.id, id, `Research position mismatch: ${id}`);
      assert.equal(row.examId, exam.id);
      assert.equal(row.sourcePosition, question.position);
      assert.ok(
        row.sourceQuestionTitle === question.title &&
          same(row.sourceOptions, question.options) &&
          same(row.images, question.images),
        `Research source differs: ${id}`,
      );
      const revision = revisions.get(id);
      if (revision) {
        const detail = cases.get(row.uniqueQuestionId);
        assert.ok(detail, `Missing research case: ${id}`);
        assert.equal(row.excludeFromSingleAnswerGrading, true);
        assert.equal(row.answerIndex, null);
        assert.equal(revision.requiresQuestionTextChange, true);
        assert.equal(revision.appliedToOriginal, false);
        assert.equal(revision.sourcePosition, question.position);
        assert.equal(revision.uniqueQuestionId, row.uniqueQuestionId);
        assert.ok(
          revision.originalQuestionTitle === question.title &&
            same(revision.originalOptions, question.options),
          `Revision source differs: ${id}`,
        );
        const explanation = overrides.explanations[row.uniqueQuestionId];
        assert.ok(typeof explanation === "string" && explanation.trim());
        clarified++;
        return {
          position: question.position,
          sourceTitle: question.title,
          sourceOptions: [...question.options],
          answer: revision.answerIndex,
          explanation,
          notes:
            "Câu luyện tập đã được làm rõ từ câu gốc; xem phần đối chiếu để hiểu lý do điều chỉnh.",
          qualified: false,
          sources: detail.sources.map(sourceFields),
          correction: {
            title: revision.stem,
            options: [...revision.options],
            reason: [
              detail.scientificAnswer,
              detail.explanation,
              detail.reasonAgainstOtherOptions,
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
        };
      }
      assert.ok(
        row.excludeFromSingleAnswerGrading === false &&
          ["supported", "qualified"].includes(row.status) &&
          Number.isInteger(row.answerIndex),
        `Unresolved original item without clarification: ${id}`,
      );
      const needsContext = row.status === "qualified";
      if (needsContext) qualified++;
      return {
        position: question.position,
        sourceTitle: question.title,
        sourceOptions: [...question.options],
        answer: row.answerIndex,
        explanation: row.explanation,
        notes: row.notes,
        qualified: needsContext,
        sources: row.sources.map(sourceFields),
      };
    });
    return { id: exam.id, answers };
  });
  assert.equal(clarified, 22, "All excluded originals need precise practice variants");
  assert.equal(qualified, 111, "Retain every source qualification");
  const value = {
    version: 1,
    checkedAt: research.compiledAt,
    official: false,
    exams,
  };
  assert.ok(parseMockAnswerKey(value), "Runtime answer schema rejected export");
  assert.ok(prepareMockPractice(bank, value), "Practice/source alignment rejected export");
  return { value, clarified, qualified };
}

async function main() {
  const root = path.resolve(".data/ncsf");
  const researchPath = path.resolve(
    process.argv[2] ?? path.join(root, "deep-research-2026-10-30/final/dap-an-ncsf-v2.json"),
  );
  const overridePath = path.resolve(
    process.argv[3] ?? path.join(root, "deep-research-2026-10-30/practice-explanations.json"),
  );
  const outputPath = path.resolve(process.argv[4] ?? path.join(root, "mock-answers.json"));
  const [bankBytes, researchBytes, overrideBytes] = await Promise.all([
    readFile(path.join(root, "mock-exams.json")),
    readFile(researchPath),
    readFile(overridePath),
  ]);
  const { value, clarified, qualified } = exportMockAnswerKey(
    bankBytes,
    researchBytes,
    JSON.parse(overrideBytes),
  );
  const body = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  const manifest = {
    generatedAt: new Date().toISOString(),
    checkedAt: value.checkedAt,
    official: false,
    sourceBankSha256: sha256(bankBytes),
    researchKeySha256: sha256(researchBytes),
    explanationOverridesSha256: sha256(overrideBytes),
    answerSha256: sha256(body),
    questions: value.exams.map((exam) => ({ id: exam.id, count: exam.answers.length })),
    clarified,
    qualified,
  };
  await writeFile(outputPath, body);
  await writeFile(
    path.join(path.dirname(outputPath), "mock-answers-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(JSON.stringify({ questions: 300, clarified, qualified, sha256: sha256(body) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  await main();
