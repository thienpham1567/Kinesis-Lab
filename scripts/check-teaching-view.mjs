import assert from "node:assert/strict";
import test from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";

const {
  createSessionTeachingView,
  createExerciseTeachingView,
  createSavedWorkoutTeachingView,
} = createAppLoader()("src/lib/training/teaching-view.ts");

const exercise = {
  id: "e1",
  exerciseId: null,
  name: "Bài custom",
  sets: 2,
  repMin: 8,
  repMax: 10,
  load: null,
  loadUnit: "kg",
  restSeconds: 60,
  rir: 2,
  tempo: "3010",
  method: "superset",
  supersetGroup: "A",
  notes: "PRIVATE_NOTE",
};
const session = {
  id: "s1",
  name: "Buổi A",
  weekday: 1,
  exercises: [exercise],
  medical_conditions: ["PRIVATE_MEDICAL"],
};
const plan = {
  kind: "plan",
  planId: "p1",
  revision: 2,
  sessionId: "s1",
  client_name: "PRIVATE_NAME",
};

test("handout projects the exact allowed prescription and excludes private fields at every level", () => {
  const view = createSessionTeachingView(plan, session);
  assert.equal(view.origin.revision, 2);
  assert.equal(view.title, "Buổi A");
  assert.equal(view.personalReminder, "");
  assert.equal(view.exercises[0].exerciseId, null);
  assert.equal(view.exercises[0].planned.load, null);
  assert.equal(view.exercises[0].planned.rir, 2);
  assert.equal(view.exercises[0].planned.tempo, "3010");
  assert.equal(view.exercises[0].planned.supersetGroup, "A");
  assert.deepEqual(
    Object.keys(view.exercises[0].planned).sort(),
    [
      "sets",
      "repMin",
      "repMax",
      "load",
      "loadUnit",
      "restSeconds",
      "rir",
      "tempo",
      "method",
      "supersetGroup",
    ].sort(),
  );
  assert.equal(JSON.stringify(view).includes("PRIVATE_"), false);
});

test("mismatched sessions are refused and empty sessions remain distinguishable", () => {
  assert.equal(
    createSessionTeachingView({ ...plan, sessionId: "bad" }, session),
    null,
  );
  const view = createSessionTeachingView(plan, { ...session, exercises: [] });
  assert.equal(view.exercises.length, 0);
});

test("only saved workout snapshots are projected; actual results and edits stay out of the payload", () => {
  const record = {
    id: "w1",
    plan_id: "archived-plan",
    session_id: "s1",
    performedAt: "2026-11-12",
    notes: "PRIVATE_NOTE",
    sets: [{ reps: 999 }],
    prescription: {
      ...session,
      name: "Buổi cũ đã lưu",
      exercises: [
        { ...exercise, loadUnit: "bodyweight", rir: 0 },
        { ...exercise, id: "e2", loadUnit: "assisted", load: 0 },
        {
          ...exercise,
          id: "e3",
          exerciseId: "unknown",
          name: "Bài dài ".repeat(20),
        },
      ],
    },
  };
  assert.equal(createSavedWorkoutTeachingView("w2", [record]), null);
  const view = createSavedWorkoutTeachingView("w1", [record]);
  assert.equal(view.title, "Buổi cũ đã lưu");
  assert.equal(view.origin.planId, "archived-plan");
  assert.equal(view.origin.performedAt, "2026-11-12");
  assert.equal(view.exercises[0].planned.loadUnit, "bodyweight");
  assert.equal(view.exercises[0].planned.rir, 0);
  assert.equal(view.exercises[1].planned.loadUnit, "assisted");
  assert.equal(view.exercises[1].planned.load, 0);
  assert.equal(view.exercises[2].name, "Bài dài ".repeat(20));
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE_|999/);
});

test("single exercise teaching view resolves the exact Atlas ID and instruction version", () => {
  assert.equal(createExerciseTeachingView("missing"), null);
  assert.equal(createExerciseTeachingView("incline-db-press "), null);
  const view = createExerciseTeachingView("incline-db-press");
  assert.equal(view.origin.instructionVersion, 1);
  assert.equal(view.exercises[0].exerciseId, "incline-db-press");
  assert.equal(view.exercises[0].planned, null);
});
