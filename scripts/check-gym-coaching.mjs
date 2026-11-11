import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader();
const { nextIncompleteSet, remainingRestSeconds, workoutSetsForExercise } =
  load("src/lib/training/coaching.ts");

test("the timer catches up after time in a background tab", () => {
  const clock = { state: "running", endsAtMs: 90_000 };
  assert.equal(remainingRestSeconds(clock, 31_000), 59);
  assert.equal(remainingRestSeconds(clock, 89_999), 1);
  assert.equal(remainingRestSeconds(clock, 95_000), 0);
  assert.equal(remainingRestSeconds({ state: "idle" }, 0), 0);
  assert.equal(
    remainingRestSeconds({ state: "paused", remainingMs: 16_999 }, 95_000),
    17,
  );
});

const first = { id: "first", sets: 2, loadUnit: "kg" };
const second = { id: "second", sets: 1, loadUnit: "bodyweight" };
const session = { exercises: [first, second] };
const completedSet = (exercise, setNumber) => ({
  exerciseId: exercise.id,
  setNumber,
  completed: true,
  reps: 8,
  load: exercise.loadUnit === "kg" ? 0 : null,
  loadUnit: exercise.loadUnit,
});

test("the next incomplete set follows the prescription even with sparse or reordered results", () => {
  const sets = [completedSet(second, 1), completedSet(first, 2)];
  assert.deepEqual(
    { ...nextIncompleteSet(session, sets) },
    { exerciseId: "first", setNumber: 1 },
  );
  assert.equal(
    nextIncompleteSet(session, [...sets, completedSet(first, 1)]),
    null,
  );
  assert.deepEqual(
    { ...nextIncompleteSet(session, []) },
    { exerciseId: "first", setNumber: 1 },
  );
  assert.equal(nextIncompleteSet({ exercises: [] }, []), null);
});

test("missing actual values remain blank even if a set has been checked", () => {
  const sets = [
    { ...completedSet(first, 1), load: null },
    completedSet(first, 2),
    completedSet(second, 1),
  ];
  assert.deepEqual(
    { ...nextIncompleteSet(session, sets) },
    { exerciseId: "first", setNumber: 1 },
  );
  const rows = workoutSetsForExercise(first, [sets[1]]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].completed, false);
  assert.equal(rows[0].load, null);
  assert.equal(rows[0].reps, null);
  assert.equal(rows[1], sets[1]);
});

test("missing rows reuse the saved actual unit of the same exercise", () => {
  const recorded = completedSet({ ...first, loadUnit: "assisted" }, 2);
  const rows = workoutSetsForExercise(first, [recorded]);
  assert.equal(rows[0].loadUnit, "assisted");
  assert.equal(rows[0].load, null);
  assert.equal(rows[1], recorded);
});

test("editing a saved set retains the order of existing results", () => {
  const { mergeWorkoutSets } = load("src/lib/training/coaching.ts");
  const existing = [completedSet(first, 1), completedSet(second, 1)];
  const edited = { ...existing[0], reps: 9 };
  const added = completedSet(first, 2);
  const result = mergeWorkoutSets(existing, [edited, added]);
  assert.equal(result[0], edited);
  assert.equal(result[1], existing[1]);
  assert.equal(result[2], added);
});
