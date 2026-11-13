import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader({
  globals: { crypto: webcrypto, AbortController, structuredClone },
  mocks: {
    "@/lib/clinical/muscle-hypertrophy-atlas": { HYPERTROPHY_EXERCISES: [] },
  },
});
const program = load("src/lib/training/program.ts");
const Model = existsSync("src/lib/training/workspace.ts")
  ? load("src/lib/training/workspace.ts").TrainingWorkspaceModel
  : undefined;
const response = (body, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
});
test("default browser fetch loads plans and workouts with its native receiver", async () => {
  const calls = [];
  const browserLoad = createAppLoader({
    globals: {
      crypto: webcrypto,
      AbortController,
      structuredClone,
      fetch: async function (url) {
        if (this?.getSnapshot) throw new TypeError("Illegal invocation");
        calls.push(url);
        return response(
          url.includes("training-plans") ? { plans: [] } : { workouts: [] },
        );
      },
    },
  });
  const { TrainingWorkspaceModel } = browserLoad(
    "src/lib/training/workspace.ts",
  );
  const model = new TrainingWorkspaceModel("synthetic-client");
  await model.load();
  assert.equal(model.getSnapshot().loadError, "");
  assert.equal(model.getSnapshot().loaded, true);
  assert.equal(calls.length, 2);
});

function setup(fetcher) {
  assert.equal(
    typeof Model,
    "function",
    "The workspace needs a state owner that survives destination switches",
  );
  return new Model("synthetic-client", fetcher);
}
function validDraft() {
  const d = program.createProgramDraft();
  d.title = "Manual draft";
  d.sessions[0].exercises[0].name = "Custom squat";
  return d;
}
const plan = {
  id: "synthetic-plan",
  client_id: "synthetic-client",
  revision: 1,
  status: "draft",
  program: validDraft(),
  source_context: null,
  created_at: "2026-11-06",
};

test("failed save retains the full manual draft and retry creates a saved revision", async () => {
  let attempts = 0;
  const m = setup(async () =>
    ++attempts === 1 ? response({ error: "Offline" }, 500) : response({ plan }),
  );
  m.editDraft(validDraft());
  await m.saveDraft();
  assert.equal(m.getSnapshot().draft.title, "Manual draft");
  assert.equal(m.getSnapshot().dirty, true);
  assert.match(m.getSnapshot().error, /Offline/);
  await m.saveDraft();
  assert.equal(m.getSnapshot().dirty, false);
  assert.equal(m.getSnapshot().plans.length, 1);
});
test("AI errors and followup questions preserve manual work; successful suggestion requires explicit application", async () => {
  let phase = 0;
  const m = setup(async () =>
    phase === 0
      ? response({ error: "Need context", questions: ["Mục tiêu?"] }, 422)
      : response({
          program: { ...validDraft(), title: "AI candidate" },
          source_context: null,
        }),
  );
  m.editDraft(validDraft());
  await m.propose();
  assert.equal(m.getSnapshot().draft.title, "Manual draft");
  assert.equal(m.getSnapshot().questions[0], "Mục tiêu?");
  phase = 1;
  await m.propose();
  assert.equal(m.getSnapshot().draft.title, "Manual draft");
  assert.equal(m.getSnapshot().proposal.program.title, "AI candidate");
  m.applyProposal();
  assert.equal(m.getSnapshot().draft.title, "AI candidate");
});
test("workout failure retries the same ID and history reopens the saved record", async () => {
  const ids = [];
  const m = setup(async (_url, options) => {
    const input = JSON.parse(options.body);
    ids.push(input.id);
    if (ids.length === 1) return response({ error: "Offline" }, 500);
    return response({
      workout: { ...input, prescription: plan.program.sessions[0] },
    });
  });
  m.startWorkout(plan, plan.program.sessions[0], "2026-11-06");
  const id = m.getSnapshot().workout.id;
  assert.equal(
    m.getSnapshot().workout.sets.some((s) => s.completed),
    false,
  );
  assert.equal(await m.saveWorkout(false), false);
  assert.match(m.getSnapshot().workoutSaveError, /Offline/);
  assert.equal(await m.saveWorkout(false), true);
  assert.equal(m.getSnapshot().workoutSaveError, "");
  assert.deepEqual(ids, [id, id]);
  const saved = m.getSnapshot().workouts[0];
  m.openWorkout(saved);
  assert.equal(m.getSnapshot().workout.id, id);
  m.startWorkout(plan, plan.program.sessions[0], "2026-11-06");
  assert.equal(
    m.getSnapshot().workout.id,
    id,
    "Existing dated session must reopen instead of duplicate",
  );
});
test("disposed client ignores stale requests; another client has independent drafts", async () => {
  let release;
  const pending = new Promise((r) => (release = r));
  let signal;
  const first = setup(async (_url, options) => {
    signal = options.signal;
    return pending;
  });
  first.editDraft(validDraft());
  const task = first.load();
  first.dispose();
  release(response({ plans: [plan], workouts: [] }));
  await task;
  assert.equal(signal.aborted, true);
  assert.equal(first.getSnapshot().plans.length, 0);
  const second = new Model("another-client", async () =>
    response({ plans: [], workouts: [] }),
  );
  assert.equal(second.getSnapshot().draft.title, "");
  assert.equal(second.getSnapshot().clientId, "another-client");
});
test("a pending workout save ignores a duplicate click and cannot populate a disposed client", async () => {
  let release;
  let saved;
  let signal;
  let writes = 0;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const model = setup(async (_url, options) => {
    writes++;
    signal = options.signal;
    saved = JSON.parse(options.body);
    return pending;
  });
  const session = plan.program.sessions[0];
  model.startWorkout(plan, session, "2026-11-06");
  const firstSave = model.saveWorkout(false);
  assert.equal(await model.saveWorkout(false), false);
  assert.equal(writes, 1);
  model.dispose();
  release(response({ workout: { ...saved, prescription: session } }));
  assert.equal(await firstSave, false);
  assert.equal(signal.aborted, true);
  assert.equal(model.getSnapshot().workouts.length, 0);
});
test("switching saved revisions and starting another workout never discards unsaved edits without explicit replacement", () => {
  const m = setup(async () => response({}));
  m.editDraft(validDraft());
  assert.equal(m.selectPlan(plan), false);
  assert.equal(m.getSnapshot().draft.title, "Manual draft");
  assert.equal(m.selectPlan(plan, true), true);
  m.startWorkout(plan, plan.program.sessions[0], "2026-11-06");
  m.editWorkout({ ...m.getSnapshot().workout, notes: "Unsaved feedback" });
  assert.equal(
    m.startWorkout(plan, plan.program.sessions[0], "2026-11-07"),
    false,
  );
  assert.equal(m.getSnapshot().workout.notes, "Unsaved feedback");
});
test("previous result matches explicit exercise identity and actual load unit across revisions", () => {
  const fn = existsSync("src/lib/training/workspace.ts")
    ? load("src/lib/training/workspace.ts").previousExerciseResult
    : undefined;
  assert.equal(typeof fn, "function");
  const exercise = {
    ...plan.program.sessions[0].exercises[0],
    id: "new-row",
    exerciseId: "squat",
    name: "Squat variant",
    loadUnit: "kg",
  };
  const old = { ...exercise, id: "old-row" };
  const workout = {
    id: "older",
    status: "completed",
    performedAt: "2026-11-05",
    prescription: { id: "s", exercises: [old] },
    sets: [
      {
        exerciseId: "old-row",
        reps: 8,
        load: 30,
        loadUnit: "kg",
        completed: true,
        setNumber: 1,
      },
    ],
  };
  assert.equal(fn(exercise, [workout], null, "2026-11-06").workout.id, "older");
  assert.equal(
    fn(
      { ...exercise, name: "Different variant" },
      [workout],
      null,
      "2026-11-06",
    ),
    null,
  );
  assert.equal(
    fn({ ...exercise, loadUnit: "assisted" }, [workout], null, "2026-11-06"),
    null,
  );
});

test("legacy log query changes retain the same client workspace identity", async () => {
  const { readFileSync } = await import("node:fs");
  const { default: vm } = await import("node:vm");
  const { default: ts } = await import("typescript");
  const exports = {};
  const jsx = (type, props, key) => ({ type, props, key });
  const output = ts.transpileModule(
    readFileSync("src/components/training/TrainingLog.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(output, {
    exports,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      return new Proxy({}, { get: () => () => null });
    },
  });
  const initial = exports.TrainingLog({
    clientId: "client-a",
    initialExerciseId: "squat",
  });
  const hidden = exports.TrainingLog({
    clientId: "client-a",
    initialExerciseId: null,
  });
  const another = exports.TrainingLog({
    clientId: "client-b",
    initialExerciseId: null,
  });
  assert.equal(
    initial.key,
    hidden.key,
    "Removing the exercise query when switching destinations must not remount the legacy draft",
  );
  assert.notEqual(
    initial.key,
    another.key,
    "A different client must get a clean state owner",
  );
});

test("next weekly session uses the next local calendar occurrence and skips a completed occurrence", () => {
  const schedule = existsSync("src/lib/training/schedule.ts")
    ? load("src/lib/training/schedule.ts")
    : {};
  assert.equal(
    typeof schedule.nextScheduledSession,
    "function",
    "Scheduling must return an actual date as well as weekday",
  );
  const monday = {
    ...plan,
    program: {
      ...plan.program,
      sessions: [{ ...plan.program.sessions[0], weekday: 1 }],
    },
  };
  assert.equal(
    schedule.nextScheduledSession(monday, [], "2026-11-06").date,
    "2026-11-09",
  );
  assert.equal(
    schedule.nextScheduledSession(monday, [], "2026-11-09").date,
    "2026-11-09",
  );
  const completed = {
    plan_id: monday.id,
    session_id: monday.program.sessions[0].id,
    performedAt: "2026-11-09",
    status: "completed",
  };
  assert.equal(
    schedule.nextScheduledSession(monday, [completed], "2026-11-09").date,
    "2026-11-16",
  );
});

test("AI proposal inspection exposes the complete prescription before draft replacement", async () => {
  assert.equal(
    existsSync("src/components/training/ProgramPreview.tsx"),
    true,
    "A proposal needs a complete read-only inspection view",
  );
  const { readFileSync } = await import("node:fs");
  const { default: vm } = await import("node:vm");
  const { default: ts } = await import("typescript");
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const exports = {};
  const output = ts.transpileModule(
    readFileSync("src/components/training/ProgramPreview.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(output, {
    exports,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "next/link") return { default: "a" };
      if (id.includes("program")) return program;
      return {
        UNIT_LABELS: {
          kg: "Tải ngoài (kg)",
          assisted: "Trợ lực (kg)",
          bodyweight: "Trọng lượng cơ thể",
        },
      };
    },
  });
  const draft = validDraft();
  Object.assign(draft, {
    equipment: "Synthetic equipment",
    constraints: "Synthetic constraints",
    progression: "Synthetic progression",
    goalDetail: "Synthetic goal",
    reviewDate: "2026-12-01",
  });
  Object.assign(draft.sessions[0].exercises[0], {
    load: 25,
    loadUnit: "kg",
    rir: 2,
    tempo: "3-1-1",
    method: "superset",
    supersetGroup: "A",
    notes: "Synthetic exercise note",
  });
  const tree = exports.ProgramPreview({ program: draft });
  const flatten = (n) =>
    n == null || typeof n === "boolean"
      ? ""
      : Array.isArray(n)
        ? n.map(flatten).join(" ")
        : typeof n !== "object"
          ? String(n)
          : flatten(n.props?.children);
  const text = flatten(tree);
  for (const expected of [
    "Synthetic equipment",
    "Synthetic constraints",
    "Synthetic progression",
    "Synthetic goal",
    "2026-12-01",
    "25",
    "2",
    "3-1-1",
    "Superset",
    "A",
    "90",
    "Synthetic exercise note",
  ])
    assert.ok(text.includes(expected), `Proposal missing ${expected}`);
  const nodes = (n) =>
    !n || typeof n !== "object"
      ? []
      : Array.isArray(n)
        ? n.flatMap(nodes)
        : [n, ...nodes(n.props?.children)];
  assert.equal(
    nodes(tree).some((n) => ["input", "select", "textarea"].includes(n.type)),
    false,
    "Inspecting a proposal must not edit or replace the manual draft",
  );
});

test("direct workout entry defaults to the selected session occurrence and preserves a manual date", async () => {
  const { readFileSync } = await import("node:fs");
  const { default: vm } = await import("node:vm");
  const { default: ts } = await import("typescript");
  const slots = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const exports = {};
  const schedule = load("src/lib/training/schedule.ts");
  const output = ts.transpileModule(
    readFileSync("src/components/training/WorkoutRunner.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(output, {
    exports,
    require(id) {
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (id === "react")
        return {
          useState(initial) {
            const i = cursor++;
            if (!(i in slots))
              slots[i] = typeof initial === "function" ? initial() : initial;
            return [slots[i], (next) => (slots[i] = next)];
          },
        };
      if (id.includes("/schedule"))
        return {
          localTrainingDate: () => "2026-11-06",
          nextScheduledSession: (p, w) =>
            schedule.nextScheduledSession(p, w, "2026-11-06"),
        };
      if (id.endsWith("/program")) return program;
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const state = { plans: [plan], workouts: [], workout: null, busy: null };
  const nodes = (n) =>
    !n || typeof n !== "object"
      ? []
      : Array.isArray(n)
        ? n.flatMap(nodes)
        : [n, ...nodes(n.props?.children)];
  const render = () => {
    cursor = 0;
    return exports.WorkoutRunner({ model: {}, state });
  };
  const dateField = (tree) =>
    nodes(tree).find((n) => n.type === "input" && n.props.type === "date");
  let tree = render();
  assert.equal(dateField(tree).props.value, "2026-11-09");
  dateField(tree).props.onChange({ target: { value: "2026-11-12" } });
  state.workouts = [];
  tree = render();
  assert.equal(
    dateField(tree).props.value,
    "2026-11-12",
    "Model rerenders must preserve an explicit date choice",
  );
});

test("opening a workout selected by the progress report protects the unsaved workout and program drafts", async () => {
  const { summarizeProgress } = load("src/lib/training/progress.ts");
  const m = setup(async () => response({}));
  const original = plan.program.sessions[0];
  const archived = {
    ...original, name: "Archived session",
    exercises: [{ ...original.exercises[0], repMin: 5, repMax: 6 }],
  };
  const saved = {
    id: "saved-workout", client_id: "synthetic-client", plan_id: "archived-plan",
    session_id: archived.id, performedAt: "2026-11-06", status: "completed",
    prescription: archived, notes: "Original result", rpe: null,
    sets: [{ exerciseId: archived.exercises[0].id, setNumber: 1, completed: true, reps: 5, load: 0, loadUnit: "kg" }],
  };
  m.editDraft({ ...validDraft(), title: "Unsaved program edits" });
  m.startWorkout(plan, original, "2026-11-08");
  m.editWorkout({ ...m.getSnapshot().workout, notes: "Unsaved workout edits" });
  const { groups } = summarizeProgress([saved], { from: null, to: null });
  const row = groups[0].rows[0];
  assert.equal(row.workoutId, saved.id);
  assert.equal(row.planned.repMin, 5);
  assert.equal(m.openWorkout(saved), false);
  assert.equal(m.getSnapshot().workout.notes, "Unsaved workout edits");
  assert.equal(m.openWorkout(saved, true), true);
  assert.equal(m.getSnapshot().workout.id, row.workoutId);
  assert.equal(m.getSnapshot().prescription.name, "Archived session");
  assert.equal(m.getSnapshot().draft.title, "Unsaved program edits");
  assert.equal(m.getSnapshot().dirty, true);
});
