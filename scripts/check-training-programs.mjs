import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppLoader } from "./lib/load-app-module.mjs";
const load = createAppLoader({
  globals: { structuredClone, crypto: globalThis.crypto },
});
const domain = load("src/lib/training/program.ts");
const valid = () => {
  const p = domain.createProgramDraft();
  p.title = "Synthetic plan";
  p.sessions[0].exercises[0].name = "Manual squat";
  return p;
};
test("manual prescriptions validate with storage bounds, unique stable IDs and explicit supersets", () => {
  const p = valid();
  assert.equal(domain.validateProgramDraft(p).title, p.title);
  for (const edit of [
    (p) => p.sessions.push({ ...p.sessions[0], id: "second" }),
    (p) => (p.sessions[0].exercises[0].sets = 0),
    (p) => (p.sessions[0].exercises[0].repMax = 0),
    (p) => (p.sessions[0].exercises[0].exerciseId = "invented"),
    (p) => (p.sessions[0].exercises[0].method = "superset"),
    (p) => (p.reviewDate = "2026-02-30"),
  ]) {
    const q = structuredClone(p);
    edit(q);
    assert.throws(() => domain.validateProgramDraft(q));
  }
  assert.throws(() => domain.validateProgramDraft(p, { ai: true }), /Atlas/);
});
test("workout completion accounts for each planned set and rejects mismatched references", () => {
  const program = valid();
  const plan = { id: "plan-1", client_id: "client-1", program };
  const w = domain.createWorkoutInput(plan, program.sessions[0], "2026-11-06");
  assert.equal(w.sets.length, program.sessions[0].exercises[0].sets);
  assert.equal(
    domain.validateWorkoutInput(w, program.sessions[0]).status,
    "in_progress",
  );
  assert.throws(() =>
    domain.validateWorkoutInput(
      { ...w, status: "completed" },
      program.sessions[0],
    ),
  );
  const done = {
    ...w,
    status: "completed",
    sets: w.sets.map((s) => ({ ...s, completed: true, reps: 8 })),
  };
  assert.equal(
    domain.validateWorkoutInput(done, program.sessions[0]).status,
    "completed",
  );
  assert.throws(() =>
    domain.validateWorkoutInput(
      { ...done, sets: [...done.sets, done.sets[0]] },
      program.sessions[0],
    ),
  );
  assert.throws(() =>
    domain.validateWorkoutInput(
      { ...done, sets: done.sets.slice(1) },
      program.sessions[0],
    ),
  );
});
function repositoryFixture(env = {}) {
  let store = {
    clients: [{ id: "client-1" }, { id: "client-2" }],
    biomarkers: [],
    documents: [],
    training_plans: [],
    training_workouts: [],
    training_records: [],
  };
  const local = createAppLoader({
    globals: { structuredClone, crypto: globalThis.crypto, process: { env } },
    mocks: {
      "@/lib/supabase/server": {
        supabase: () => {
          throw new Error("must not fall back");
        },
      },
      "@/lib/local-store": {
        readLocalStore: () => {
          throw new Error("real store forbidden");
        },
        writeLocalStore: () => {
          throw new Error("real store forbidden");
        },
      },
    },
  });
  const repo = local("src/lib/training/repository.ts").createTrainingRepository(
    {
      read: () => structuredClone(store),
      write: (s) => {
        store = structuredClone(s);
      },
    },
  );
  return { repo, store: () => structuredClone(store) };
}
test("local immutable revisions switch one active plan atomically and reject cross-client mutations", async () => {
  const f = repositoryFixture();
  const a = await f.repo.savePlan({ client_id: "client-1", program: valid() });
  const b = await f.repo.savePlan({
    client_id: "client-1",
    base_plan_id: a.id,
    program: { ...valid(), title: "Next" },
  });
  assert.notEqual(a.id, b.id);
  assert.equal(b.revision, 2);
  assert.equal(a.status, "draft");
  await Promise.all([
    f.repo.setPlanStatus("client-1", a.id, "active"),
    f.repo.setPlanStatus("client-1", b.id, "active"),
  ]);
  const plans = await f.repo.listPlans("client-1");
  assert.equal(plans.filter((p) => p.status === "active").length, 1);
  assert.equal(
    plans.find((p) => p.id === a.id).program.title,
    "Synthetic plan",
  );
  await assert.rejects(() => f.repo.setPlanStatus("client-2", a.id, "active"));
  await assert.rejects(() =>
    f.repo.savePlan({
      client_id: "client-2",
      base_plan_id: a.id,
      program: valid(),
    }),
  );
  await assert.rejects(() =>
    f.repo.savePlan({ client_id: "missing", program: valid() }),
  );
});
test("workout retries reuse ID, snapshot immutable prescription, reopen, and reject hijacking or reference changes", async () => {
  const f = repositoryFixture();
  const plan = await f.repo.savePlan({
    client_id: "client-1",
    program: valid(),
  });
  const input = domain.createWorkoutInput(
    plan,
    plan.program.sessions[0],
    "2026-11-06",
  );
  const first = await f.repo.saveWorkout(input);
  const second = await f.repo.saveWorkout(input);
  assert.equal(first.id, second.id);
  assert.equal((await f.repo.listWorkouts("client-1")).length, 1);
  assert.equal(first.prescription.exercises[0].name, "Manual squat");
  const completed = await f.repo.saveWorkout({
    ...input,
    status: "completed",
    sets: input.sets.map((s) => ({ ...s, reps: 8, completed: true })),
  });
  assert.equal(completed.status, "completed");
  assert.equal(
    (await f.repo.saveWorkout({ ...input, status: "in_progress" })).status,
    "in_progress",
  );
  await assert.rejects(() =>
    f.repo.saveWorkout({ ...input, client_id: "client-2" }),
  );
  const revision = await f.repo.savePlan({
    client_id: "client-1",
    base_plan_id: plan.id,
    program: valid(),
  });
  await assert.rejects(() =>
    f.repo.saveWorkout({ ...input, plan_id: revision.id }),
  );
  assert.equal(f.store().training_workouts.length, 1);
});
test("partial Supabase configuration never selects local store", async () => {
  const f = repositoryFixture({ SUPABASE_URL: "https://synthetic.invalid" });
  await assert.rejects(() => f.repo.listPlans("client-1"), /cấu hình/i);
});
function routeFixture({
  raw,
  upstreamError = false,
  configured = true,
  initialStore = {},
  env = {},
} = {}) {
  let store = {
    clients: [{ id: "client-1", name: "Synthetic", goals: "Synthetic goal" }],
    biomarkers: [],
    documents: [],
    training_records: [],
    training_plans: [],
    training_workouts: [],
    ...initialStore,
  };
  const calls = [];
  const mocks = {
    "@/lib/local-store": {
      readLocalStore: () => structuredClone(store),
      writeLocalStore: (s) => {
        store = structuredClone(s);
      },
    },
    "@/lib/supabase/server": {
      hasSupabase: () => false,
      supabase: () => {
        throw new Error("unexpected remote");
      },
    },
    "@/lib/ai/openrouter": {
      pickChatModel: () => "mock-model",
      chatComplete: async (options) => {
        calls.push(options);
        if (upstreamError) throw new Error("PRIVATE_UPSTREAM");
        return raw;
      },
    },
  };
  const load = createAppLoader({
    globals: {
      structuredClone,
      crypto: globalThis.crypto,
      process: {
        env: {
          ...(configured ? { OPENROUTER_API_KEY: "synthetic" } : {}),
          ...env,
        },
      },
    },
    mocks,
  });
  const routes = {
    client: load("src/app/api/clients/[id]/route.ts"),
    plans: load("src/app/api/training-plans/route.ts"),
    workouts: load("src/app/api/training-workouts/route.ts"),
    propose: load("src/app/api/training-plans/propose/route.ts"),
  };
  const req = (body) => ({
    json: async () => body,
    url: "http://synthetic/api?client_id=client-1",
  });
  return { routes, req, calls, store: () => structuredClone(store) };
}
test("real program/workout route handlers validate malformed payloads and preserve synthetic history", async () => {
  const f = routeFixture();
  assert.equal((await f.routes.plans.POST(f.req(null))).status, 400);
  assert.equal(
    (
      await f.routes.plans.POST({
        json: async () => {
          throw new Error("bad JSON");
        },
      })
    ).status,
    400,
  );
  const res = await f.routes.plans.POST(
    f.req({ client_id: "client-1", program: valid() }),
  );
  assert.equal(res.status, 201);
  const { plan } = await res.json();
  assert.equal(
    (await (await f.routes.plans.GET(f.req())).json()).plans.length,
    1,
  );
  assert.equal(
    (
      await f.routes.plans.PATCH(
        f.req({ client_id: "client-2", plan_id: plan.id, status: "active" }),
      )
    ).status,
    404,
  );
  const workout = domain.createWorkoutInput(
    plan,
    plan.program.sessions[0],
    "2026-11-06",
  );
  assert.equal((await f.routes.workouts.PUT(f.req(workout))).status, 200);
  assert.equal(
    (await (await f.routes.workouts.GET(f.req())).json()).workouts.length,
    1,
  );
});
test("AI returns validated catalog-only editable drafts, preserves intake, and never persists", async () => {
  const p = valid();
  const catalog = load("src/lib/clinical/muscle-hypertrophy-atlas.ts")
    .HYPERTROPHY_EXERCISES[0];
  p.sessions[0].exercises[0] = {
    ...p.sessions[0].exercises[0],
    exerciseId: catalog.id,
    name: `${catalog.name} · ${catalog.vietnameseName}`,
  };
  const f = routeFixture({ raw: JSON.stringify({ program: p }) });
  const res = await f.routes.propose.POST(
    f.req({ client_id: "client-1", draft: p }),
  );
  assert.equal(res.status, 200);
  const result = await res.json();
  assert.equal(result.program.weeks, p.weeks);
  assert.equal(result.source_context.reviewedBy, null);
  assert.ok(Object.keys(result.source_context.records).includes(catalog.id));
  assert.equal(f.store().training_plans.length, 0);
  assert.equal(f.calls[0].json, true);
  assert.ok(f.calls[0].messages[0].content.includes("2026-10-22"));
  for (const raw of [
    "not json",
    JSON.stringify({ program: { ...p, weeks: p.weeks + 1 } }),
    JSON.stringify({
      program: {
        ...p,
        sessions: [
          {
            ...p.sessions[0],
            exercises: [
              { ...p.sessions[0].exercises[0], exerciseId: "invented" },
            ],
          },
        ],
      },
    }),
  ]) {
    const bad = routeFixture({ raw });
    const response = await bad.routes.propose.POST(
      bad.req({ client_id: "client-1", draft: p }),
    );
    assert.equal(response.status, 502);
    assert.equal((await response.json()).retryable, true);
    assert.equal(bad.store().training_plans.length, 0);
  }
  const bad = routeFixture({ upstreamError: true });
  const fail = await bad.routes.propose.POST(
    bad.req({ client_id: "client-1", draft: p }),
  );
  assert.equal(fail.status, 502);
  assert.ok(!(await fail.text()).includes("PRIVATE"));
  assert.equal(
    (
      await routeFixture({ configured: false }).routes.propose.POST(
        f.req({ client_id: "client-1", draft: p }),
      )
    ).status,
    503,
  );
});
test("submitted source contexts cannot forge professional review or source access metadata", async () => {
  const f = routeFixture();
  const context = load("src/lib/training/sources.ts").programSourceContext([]);
  assert.equal(
    (
      await f.routes.plans.POST(
        f.req({
          client_id: "client-1",
          program: valid(),
          source_context: { ...context, reviewedBy: "Imaginary clinician" },
        }),
      )
    ).status,
    400,
  );
});

test("AI preserves bounded missing-information questions without changing a draft", async () => {
  const f = routeFixture({
    raw: JSON.stringify({ needs_information: ["Cần thông tin thiết bị"] }),
  });
  const response = await f.routes.propose.POST(
    f.req({ client_id: "client-1", draft: valid() }),
  );
  assert.equal(response.status, 422);
  assert.deepEqual((await response.json()).questions, [
    "Cần thông tin thiết bị",
  ]);
  assert.equal(f.store().training_plans.length, 0);
});
test("history summary stays bounded valid JSON without inferring completed sets", () => {
  const summary = load("src/lib/training/history.ts").trainingHistorySummary;
  const p = valid();
  const plan = { id: "plan-1", client_id: "client-1", program: p };
  const w = {
    ...domain.createWorkoutInput(plan, p.sessions[0], "2026-11-06"),
    prescription: p.sessions[0],
  };
  w.prescription.exercises = Array.from({ length: 12 }, (_, i) => ({
    ...w.prescription.exercises[0],
    id: `exercise-${i}`,
    name: "x".repeat(180),
  }));
  w.sets = w.prescription.exercises.flatMap((e) =>
    Array.from({ length: 100 }, (_, i) => ({
      exerciseId: e.id,
      setNumber: i + 1,
      reps: null,
      load: null,
      loadUnit: "bodyweight",
      completed: false,
    })),
  );
  const text = summary({
    legacy: [],
    workouts: Array.from({ length: 6 }, () => ({
      ...w,
      notes: "x".repeat(4000),
    })),
  });
  const json = text.slice(text.indexOf("\n") + 1);
  assert.ok(json.length <= 16000);
  assert.ok(JSON.parse(json).truncated);
  assert.ok(!json.includes('"completed":true'));
});
test("proposal passes an abort signal to the finite-timeout AI adapter", async () => {
  const f = routeFixture({ raw: "invalid" });
  await f.routes.propose.POST({
    ...f.req({ client_id: "client-1", draft: valid() }),
    signal: new AbortController().signal,
  });
  assert.ok(f.calls[0].signal instanceof AbortSignal);
});
test("Supabase missing migration errors are explicit and never write a local fallback", async () => {
  let reads = 0;
  const client = { id: "00000000-0000-4000-8000-000000000001" };
  const db = {
    from(table) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({ data: client, error: null }),
        order: async () => ({
          data: null,
          error: { code: "42P01", message: "PRIVATE_DATABASE_DETAILS" },
        }),
      };
    },
  };
  const remote = createAppLoader({
    globals: {
      process: {
        env: {
          SUPABASE_URL: "https://synthetic.invalid",
          SUPABASE_SERVICE_ROLE_KEY: "synthetic",
        },
      },
    },
    mocks: {
      "@/lib/local-store": {
        readLocalStore() {
          reads++;
          throw new Error("forbidden");
        },
        writeLocalStore() {
          throw new Error("forbidden");
        },
      },
      "@/lib/supabase/server": { supabase: () => db },
    },
  });
  await assert.rejects(
    () =>
      remote("src/lib/training/repository.ts").trainingRepository.listPlans(
        client.id,
      ),
    (error) =>
      error.status === 503 &&
      error.message.includes("004") &&
      !error.message.includes("PRIVATE"),
  );
  assert.equal(reads, 0);
});
test("client deletion cascades new local plans/workouts while preserving other client and legacy data", async () => {
  const f = routeFixture({
    initialStore: {
      clients: [{ id: "client-1" }, { id: "client-2" }],
      training_records: [{ id: "legacy", client_id: "client-2" }],
      training_plans: [
        { id: "other-plan", client_id: "client-2", revision: 1 },
      ],
      training_workouts: [{ id: "other-workout", client_id: "client-2" }],
    },
  });
  const { plan } = await (
    await f.routes.plans.POST(
      f.req({ client_id: "client-1", program: valid() }),
    )
  ).json();
  await f.routes.workouts.PUT(
    f.req(
      domain.createWorkoutInput(plan, plan.program.sessions[0], "2026-11-06"),
    ),
  );
  await f.routes.client.DELETE(
    {},
    { params: Promise.resolve({ id: "client-1" }) },
  );
  assert.equal(f.store().clients.length, 1);
  assert.equal(f.store().training_plans.length, 1);
  assert.equal(f.store().training_workouts.length, 1);
  assert.equal(f.store().training_records[0].id, "legacy");
  assert.equal(f.store().training_plans[0].id, "other-plan");
  assert.equal(f.store().training_workouts[0].id, "other-workout");
});
test("local store reads old arrays without losing unknown keys and rejects malformed program collections", async () => {
  const { mkdtempSync, writeFileSync, mkdirSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "pt-training-store-"));
  mkdirSync(join(dir, ".data"));
  const file = join(dir, ".data", "clinical-store.json");
  const loader = createAppLoader({
    globals: { process: { cwd: () => dir, pid: process.pid } },
  });
  try {
    const local = loader("src/lib/local-store.ts");
    writeFileSync(
      file,
      JSON.stringify({
        clients: [],
        biomarkers: [],
        documents: [],
        custom_preserved: { version: 1 },
      }),
    );
    assert.equal(local.readLocalStore().custom_preserved.version, 1);
    assert.equal(local.readLocalStore().training_plans.length, 0);
    for (const field of ["training_plans", "training_workouts"]) {
      writeFileSync(
        file,
        JSON.stringify({
          clients: [],
          biomarkers: [],
          documents: [],
          [field]: { broken: true },
        }),
      );
      assert.throws(() => local.readLocalStore(), /không hợp lệ/);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("client deletion refuses partial Supabase configuration without touching local data", async () => {
  const f = routeFixture({
    env: { SUPABASE_URL: "https://synthetic.invalid" },
    initialStore: {
      training_plans: [{ id: "local-plan", client_id: "client-1" }],
      training_workouts: [{ id: "local-workout", client_id: "client-1" }],
    },
  });
  const before = f.store();
  const res = await f.routes.client.DELETE(
    {},
    { params: Promise.resolve({ id: "client-1" }) },
  );
  assert.equal(res.status, 503);
  assert.deepEqual(f.store(), before);
});
