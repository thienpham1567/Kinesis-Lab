import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader();
const { getExerciseInstruction, EXERCISE_INSTRUCTION_IDS, EXERCISE_INSTRUCTIONS } = load(
  "src/lib/clinical/exercise-instructions.ts",
);
const { HYPERTROPHY_EXERCISES } = load("src/lib/clinical/muscle-hypertrophy-atlas.ts");

const catalogIds = new Set(HYPERTROPHY_EXERCISES.map((e) => e.id));
const EXPECTED = [
  "incline-db-press",
  "cable-chest-fly",
  "cable-lateral-raise",
  "chest-supported-tbar-row",
  "glute-bulgarian-split-squat",
  "barbell-hip-thrust",
];
const ABSOLUTE = /đúng cho mọi người|ngăn chấn thương|phòng chấn thương|cô lập hoàn toàn|bảo vệ gối|chắc chắn/i;
const sections = (card) => [
  ...card.setup,
  ...card.execution,
  ...card.cues,
  ...card.observations,
  ...card.adjustments.map((a) => a.suggestion),
];

test("only authored cards resolve and their source scope stays visible", () => {
  const card = getExerciseInstruction("incline-db-press");
  assert.equal(card.exerciseId, "incline-db-press");
  assert.equal(card.reviewedBy, null);
  assert.ok(card.limitations.length > 0);
  assert.equal(getExerciseInstruction("unknown-exercise"), null);
  assert.equal(getExerciseInstruction("neutral-lat-pulldown"), null);
  assert.equal(getExerciseInstruction("incline-db-press "), null);
  assert.equal(getExerciseInstruction("__proto__"), null);
  assert.equal(getExerciseInstruction(null), null);
});

test("exactly the six planned ids, unique, all in the exercise catalog", () => {
  assert.deepEqual([...EXERCISE_INSTRUCTION_IDS].sort(), [...EXPECTED].sort());
  assert.equal(EXERCISE_INSTRUCTIONS.length, 6);
  assert.equal(new Set(EXERCISE_INSTRUCTIONS.map((c) => c.exerciseId)).size, 6);
  for (const card of EXERCISE_INSTRUCTIONS) {
    assert.ok(catalogIds.has(card.exerciseId), card.exerciseId);
    assert.ok(Number.isInteger(card.version) && card.version > 0, card.exerciseId);
  }
});

test("card shape follows the content contract", () => {
  for (const card of EXERCISE_INSTRUCTIONS) {
    const id = card.exerciseId;
    assert.ok(card.setup.length >= 1, `${id} setup`);
    assert.ok(card.execution.length >= 3 && card.execution.length <= 5, `${id} execution steps`);
    assert.ok(card.cues.length >= 2 && card.cues.length <= 3, `${id} cues`);
    assert.ok(card.observations.length >= 1, `${id} observations`);
    assert.ok(card.adjustments.length >= 1, `${id} adjustments`);
    assert.ok(card.limitations.length >= 1, `${id} limitations`);
    assert.ok(card.variantNote.length > 0, `${id} variant note`);
    assert.equal(card.reviewedBy, null, id);
    for (const adj of card.adjustments) {
      assert.ok(adj.context.length > 0, `${id} adjustment context`);
      if (adj.alternativeExerciseId !== null) {
        assert.ok(catalogIds.has(adj.alternativeExerciseId), `${id} alt ${adj.alternativeExerciseId}`);
        assert.notEqual(adj.alternativeExerciseId, id);
      }
    }
    // cues must be explicit spoken examples, never sourced claims
    for (const cue of card.cues) assert.equal(cue.kind, "coaching-example", `${id} cue kind`);
  }
});

test("every sourced line has an HTTPS source with real date and reading scope", () => {
  for (const card of EXERCISE_INSTRUCTIONS) {
    for (const item of sections(card)) {
      assert.ok(item.text.trim().length > 0);
      assert.ok(item.kind === "sourced" || item.kind === "coaching-example");
      if (item.kind === "coaching-example") {
        assert.equal("sources" in item, false, "coaching examples carry no sources");
        continue;
      }
      assert.ok(item.sources.length >= 1, `${card.exerciseId}: ${item.text}`);
      for (const source of item.sources) {
        assert.match(source.url, /^https:\/\//);
        assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(!Number.isNaN(Date.parse(source.checkedAt)));
        assert.ok(source.title.length > 0);
        assert.ok(source.access.trim().length > 0, "access scope present");
      }
    }
  }
});

test("no absolute or diagnostic wording and no 3D/activation data presented as proof", () => {
  for (const card of EXERCISE_INSTRUCTIONS) {
    const text = [...sections(card).map((i) => i.text), ...card.limitations, card.variantNote].join("\n");
    assert.doesNotMatch(text, ABSOLUTE, card.exerciseId);
    assert.doesNotMatch(text, /activationPct|%\s*kích hoạt|mô phỏng 3D/i, card.exerciseId);
    assert.doesNotMatch(text, /cơ yếu|chẩn đoán là|dự đoán chấn thương/i, card.exerciseId);
  }
});

test("media is either absent or fully described with an existing, permitted asset", () => {
  for (const card of EXERCISE_INSTRUCTIONS) {
    if (card.media === null) continue;
    for (const key of ["src", "poster", "captions", "credit", "license", "sourceUrl"]) {
      assert.ok(card.media[key]?.trim(), `${card.exerciseId} media.${key}`);
    }
    assert.match(card.media.sourceUrl, /^https:\/\//);
    for (const key of ["src", "poster", "captions"]) {
      assert.ok(card.media[key].startsWith("/exercise-instructions/"), key);
      assert.ok(existsSync(`public${card.media[key]}`), `${card.media[key]} exists`);
    }
    assert.ok(card.media.captions.endsWith(".vtt"));
  }
});

test("source scope and media provenance files exist", () => {
  assert.ok(existsSync("public/exercise-instructions/SOURCES.md"));
  assert.ok(existsSync("docs/research/2026-11-12-exercise-instruction-scope.md"));
});
