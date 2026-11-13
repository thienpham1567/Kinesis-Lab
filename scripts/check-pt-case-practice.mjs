import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader();
const { evaluateCaseChoices } = load("src/lib/learning/case-engine.ts");
const { PT_CASES } = load("src/lib/learning/pt-cases.ts");
const ids = (value) => Array.from(value);

test("each case accepts multiple ways to address the first criterion and distinguishes an early exit", () => {
  assert.equal(PT_CASES.length, 4);
  for (const scenario of PT_CASES) {
    const start = scenario.checkpoints.find(
      (step) => step.id === scenario.entryCheckpointId,
    );
    const [first, alternative, early] = start.choices;
    const expected = [start.criterionIds[0]];
    assert.deepEqual(
      ids(evaluateCaseChoices(scenario, [first.id]).addressedCriterionIds),
      expected,
    );
    assert.deepEqual(
      ids(
        evaluateCaseChoices(scenario, [alternative.id]).addressedCriterionIds,
      ),
      expected,
    );
    const ended = evaluateCaseChoices(scenario, [early.id]);
    assert.equal(ended.nextCheckpointId, null);
    assert.deepEqual(ids(ended.revisitCriterionIds), expected);
    assert.equal(
      ended.unpracticedCriterionIds.length,
      scenario.criteria.length - expected.length,
    );
    assert.throws(
      () => evaluateCaseChoices(scenario, [early.id, first.id]),
      /checkpoint/i,
    );
    assert.throws(
      () => evaluateCaseChoices(scenario, ["unknown"]),
      /checkpoint/i,
    );
    assert.throws(
      () => evaluateCaseChoices(scenario, [first.id, first.id]),
      /checkpoint/i,
    );
  }
});

test("every authored path terminates, reaches a valid step and accounts for each criterion", () => {
  assert.equal(new Set(PT_CASES.map((scenario) => scenario.id)).size, 4);
  for (const scenario of PT_CASES) {
    assert.ok(
      scenario.checkpoints.length >= 3 && scenario.checkpoints.length <= 5,
    );
    assert.equal(scenario.reviewedBy, null);
    const choiceIds = scenario.checkpoints.flatMap((step) =>
      step.choices.map((choice) => choice.id),
    );
    assert.equal(new Set(choiceIds).size, choiceIds.length);
    const reached = new Set();
    const criteria = new Set(
      scenario.criteria.map((criterion) => criterion.id),
    );
    for (const criterion of scenario.criteria) {
      if (criterion.basis === "sourced") assert.ok(criterion.sources.length);
      for (const source of criterion.sources) {
        assert.equal(new URL(source.url).protocol, "https:");
        assert.ok(source.access);
        assert.match(source.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
      }
    }
    function walk(path, visited) {
      const result = evaluateCaseChoices(scenario, path);
      const outcomes = [
        ...result.addressedCriterionIds,
        ...result.revisitCriterionIds,
        ...result.unpracticedCriterionIds,
      ];
      assert.equal(outcomes.length, criteria.size);
      assert.deepEqual(new Set(outcomes), criteria);
      if (result.nextCheckpointId === null) return;
      assert.ok(!visited.includes(result.nextCheckpointId), "cyclic path");
      const step = scenario.checkpoints.find(
        (step) => step.id === result.nextCheckpointId,
      );
      assert.ok(step);
      reached.add(step.id);
      for (const id of step.criterionIds) assert.ok(criteria.has(id));
      for (const choice of step.choices) {
        assert.ok(choice.feedback);
        assert.ok(
          choice.criterionIds.every((id) => step.criterionIds.includes(id)),
        );
        walk([...path, choice.id], [...visited, step.id]);
      }
    }
    walk([], []);
    assert.equal(reached.size, scenario.checkpoints.length);
  }
});
