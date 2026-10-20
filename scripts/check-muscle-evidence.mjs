import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Data integrity only. Passing this check does not validate medical accuracy.
const importData = async (relativePath) => {
  const content = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(content, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};

const { MUSCLE_GROUP_ATLAS, HYPERTROPHY_EXERCISES } = await importData("../src/lib/clinical/muscle-hypertrophy-atlas.ts");
const { MUSCLE_GROUP_EVIDENCE, EXERCISE_EVIDENCE, MUSCLE_EVIDENCE_REVIEW } = await importData("../src/lib/clinical/evidence-muscle.ts");

for (const [items, evidence, count] of [
  [MUSCLE_GROUP_ATLAS, MUSCLE_GROUP_EVIDENCE, 11],
  [HYPERTROPHY_EXERCISES, EXERCISE_EVIDENCE, 13],
]) {
  assert.equal(items.length, count, "Expected audited dataset coverage");
  assert.equal(new Set(items.map(item => item.id)).size, items.length, "Duplicate IDs");
  assert.deepEqual(Object.keys(evidence).sort(), items.map(item => item.id).sort(), "Evidence must cover exactly the live IDs");
  for (const item of items) {
    const entry = evidence[item.id];
    assert.equal(entry.reviewedBy, null, `${item.id}: expert review must stay pending`);
    assert.ok(["limited", "literature-reviewed"].includes(entry.status));
    assert.ok(entry.sources.length && entry.supportedClaims.length && entry.limitations.length);
    assert.ok(entry.limitations.some(limit => limit.includes("reviewedBy = null")));
    for (const source of entry.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(source.title && source.access);
    }
    for (const claim of entry.supportedClaims) {
      assert.match(claim, /\[\d+(?:,\d+)*\]/, `${item.id}: claim needs a source index`);
      for (const match of claim.matchAll(/\[(\d+(?:,\d+)*)\]/g)) {
        for (const index of match[1].split(",").map(Number)) {
          assert.ok(index >= 1 && index <= entry.sources.length, `${item.id}: source index ${index} is missing`);
        }
      }
    }
    for (const reference of item.references ?? []) {
      assert.ok(entry.sources.some(source => source.title === reference.title && source.url === reference.url), `${item.id}: reference must match checked source title and URL`);
      if (reference.pmid) assert.equal(reference.url, `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`);
    }
    for (const subdivision of item.subdivisions ?? []) {
      assert.ok(entry.supportedClaims.some(claim => claim.includes(subdivision.id)), `${subdivision.id}: missing explicit claim mapping`);
    }
    for (const target of item.targets ?? []) {
      assert.equal(target.activationPct, 0, `${item.id}: fabricated activation percentage`);
      assert.ok(["primary", "synergist", "stabilizer"].includes(target.role));
      assert.ok(MUSCLE_GROUP_EVIDENCE[target.muscleId], `${item.id}: unknown target`);
    }
  }
}
assert.equal(MUSCLE_GROUP_ATLAS.flatMap(group => group.subdivisions).length, 27);
assert.equal(HYPERTROPHY_EXERCISES.flatMap(exercise => exercise.targets).length, 32);
assert.equal(MUSCLE_EVIDENCE_REVIEW.reviewedBy, null);
assert.equal(MUSCLE_EVIDENCE_REVIEW.reviewedAt, null);
assert.equal(MUSCLE_EVIDENCE_REVIEW.spatialMappingStatus, "pending-qualified-expert-review");
console.log("Muscle evidence integrity: 11 groups, 27 subdivisions, 13 exercises, 32 qualitative targets covered; expert review pending.");
