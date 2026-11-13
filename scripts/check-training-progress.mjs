import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const {
  summarizeProgress,
  exerciseComparisonKey,
  externalLoadRepetitions,
  rowChartValue,
  quickProgressRange,
  filterLegacyProgress,
} = createAppLoader()("src/lib/training/progress.ts");

const base = {
  id: "line-a",
  exerciseId: "squat",
  name: "Squat A",
  sets: 2,
  repMin: 8,
  repMax: 10,
  load: 30,
  loadUnit: "kg",
  method: "straight",
  tempo: "3010",
};
const range = { from: "2026-10-31", to: "2026-11-13" };
const set = (load, reps, loadUnit = "kg", extra = {}) => ({
  exerciseId: base.id,
  setNumber: 1,
  load,
  reps,
  loadUnit,
  completed: true,
  ...extra,
});
const workout = (id, performedAt, sets, extra = {}) => ({
  id,
  performedAt,
  sets,
  status: "completed",
  plan_id: "old-plan",
  prescription: { name: "Buổi A", exercises: [base] },
  ...extra,
});

test("external load uses confirmed kg sets with recorded reps and load", () => {
  assert.equal(
    externalLoadRepetitions([
      set(20, 10),
      set(30, 8, "assisted"),
      set(50, 10, "kg", { completed: false }),
      set(null, 10),
      set(30, null),
      set(null, 5, "bodyweight"),
      set(0, 4),
    ]),
    200,
  );
});

test("counts saved workouts and confirmed sets by inclusive local date, with trends from completed workouts", () => {
  const items = [
    workout("last", "2026-11-13", [
      set(0, 5),
      set(null, 7, "kg", { setNumber: 2 }),
    ]),
    workout(
      "first",
      "2026-10-31",
      [set(25, 8), set(31, 12, "kg", { setNumber: 2, completed: false })],
      { status: "in_progress" },
    ),
    workout("before", "2026-10-30", [set(90, 20)]),
    workout("after", "2026-11-14", [set(90, 20)]),
  ];
  const result = summarizeProgress(items, range);
  assert.equal(result.completedWorkouts, 1);
  assert.equal(result.inProgressWorkouts, 1);
  assert.equal(result.confirmedSets, 3);
  assert.deepEqual(
    Array.from(result.completedWorkoutSets, (s) => [
      s.workoutId,
      s.exerciseId,
      s.load,
    ]),
    [
      ["last", "line-a", 0],
      ["last", "line-a", null],
    ],
  );
  assert.deepEqual(
    Array.from(result.groups[0].rows, ({ workoutId }) => workoutId),
    ["last", "first"],
  );
  assert.equal(result.groups[0].rows[0].planned.load, 30);
  assert.equal(result.groups[0].rows[0].sets.length, 2);
  assert.equal(result.groups[0].rows[1].sets.length, 1);
});

test("comparison groups share only the same catalog, variant, unit, method and tempo", () => {
  const key = exerciseComparisonKey(base, "kg");
  assert.equal(
    exerciseComparisonKey({ ...base, id: "new-line", load: 40 }, "kg"),
    key,
  );
  assert.notEqual(
    exerciseComparisonKey({ ...base, name: "Squat B" }, "kg"),
    key,
  );
  assert.notEqual(
    exerciseComparisonKey({ ...base, exerciseId: "other" }, "kg"),
    key,
  );
  assert.notEqual(exerciseComparisonKey(base, "assisted"), key);
  assert.notEqual(
    exerciseComparisonKey({ ...base, method: "superset" }, "kg"),
    key,
  );
  assert.notEqual(exerciseComparisonKey({ ...base, tempo: "2010" }, "kg"), key);
  const custom = { ...base, exerciseId: null, name: "  Bài   A " };
  assert.equal(
    exerciseComparisonKey(custom, "kg"),
    exerciseComparisonKey({ ...custom, name: "Ba\u0300i a" }, "kg"),
  );
});

test("each report row preserves the prescription from its own workout and groups by actual units", () => {
  const changed = {
    ...base,
    id: "line-b",
    sets: 3,
    repMin: 5,
    repMax: 6,
    load: 45,
  };
  const result = summarizeProgress(
    [
      workout("old", "2026-11-03", [
        set(25, 8),
        set(12, 4, "assisted", { setNumber: 2 }),
      ]),
      workout(
        "new",
        "2026-11-04",
        [set(42, 5, "kg", { exerciseId: "line-b" })],
        {
          plan_id: "new-plan",
          prescription: { name: "Buổi B", exercises: [changed] },
        },
      ),
    ],
    range,
  );
  const kg = result.groups.find((group) => group.unit === "kg");
  const assisted = result.groups.find((group) => group.unit === "assisted");
  assert.deepEqual(
    Array.from(kg.rows, ({ workoutId, exerciseId, planned }) => [
      workoutId,
      exerciseId,
      planned.sets,
      planned.load,
    ]),
    [
      ["new", "line-b", 3, 45],
      ["old", "line-a", 2, 30],
    ],
  );
  assert.equal(assisted.rows[0].planned.loadUnit, "kg");
  assert.equal(assisted.rows[0].sets[0].load, 12);
});

test("invalid or reversed ranges are rejected; quick ranges use inclusive calendar days", () => {
  assert.throws(
    () => summarizeProgress([], { from: "2026-02-30", to: null }),
    /Ngày/,
  );
  assert.throws(
    () => summarizeProgress([], { from: "2026-11-13", to: "2026-10-31" }),
    /Ngày bắt đầu/,
  );
  assert.equal(summarizeProgress([], range).confirmedSets, 0);
  assert.equal(quickProgressRange(4, "2026-11-01").from, "2026-10-05");
  assert.equal(quickProgressRange(12, "2026-11-01").from, "2026-08-10");
  assert.equal(
    summarizeProgress(
      [workout("future", "2026-11-20", [])],
      quickProgressRange(4, "2026-11-13"),
    ).completedWorkouts,
    0,
  );
});

test("legacy logs use the date filter and never become confirmed workout sets", () => {
  const legacy = [
    { id: "legacy", recorded_at: "2026-11-13", sets: 3 },
    { id: "older", recorded_at: "2026-10-30", sets: 5 },
  ];
  assert.deepEqual(
    Array.from(filterLegacyProgress(legacy, range), ({ id }) => id),
    ["legacy"],
  );
  assert.equal(summarizeProgress([], range).confirmedSets, 0);
});

test("chart metrics retain zero and omit missing, assisted and unfinished rows", () => {
  const row = (sets, status = "completed") => ({ sets, status });
  assert.equal(rowChartValue(row([set(0, 8)]), "kg"), 0);
  assert.equal(rowChartValue(row([set(20, 8), set(null, 8)]), "kg"), null);
  assert.equal(rowChartValue(row([set(20, 8)], "in_progress"), "kg"), null);
  assert.equal(rowChartValue(row([set(10, 8, "assisted")]), "assisted"), null);
  assert.equal(
    rowChartValue(
      row([set(null, 8, "bodyweight"), set(null, 7, "bodyweight")]),
      "bodyweight",
    ),
    15,
  );
});
