// Optional isolated PostgreSQL verification. Never connects to a remote database.
// Install @electric-sql/pglite outside the project, then set TRAINING_SQL_PGLITE_MODULE
// to its dist/index.js. See docs/training-program-storage.md.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
const modulePath = process.env.TRAINING_SQL_PGLITE_MODULE;
if (!modulePath)
  throw new Error(
    "Set TRAINING_SQL_PGLITE_MODULE to an isolated @electric-sql/pglite dist/index.js; no remote database is used.",
  );
const { PGlite } = await import(pathToFileURL(modulePath).href);
const migration = await readFile(
  new URL("../supabase/migrations/004_training_programs.sql", import.meta.url),
  "utf8",
);
test("migration RPCs enforce immutable revisions, one active revision, snapshot ownership and retry idempotence", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls; create table clients(id uuid primary key);",
    );
    await db.exec(migration);
    const c = "00000000-0000-4000-8000-000000000001",
      other = "00000000-0000-4000-8000-000000000002";
    await db.query("insert into clients values ($1),($2)", [c, other]);
    const program = {
      sessions: [
        {
          id: "session",
          name: "Synthetic",
          weekday: 1,
          exercises: [{ id: "exercise", name: "Synthetic variant", sets: 2 }],
        },
      ],
    };
    const save = async (client = c, base = null) =>
      (
        await db.query(
          "select save_training_plan($1,$2::jsonb,null,$3) as plan",
          [client, JSON.stringify(program), base],
        )
      ).rows[0].plan;
    const a = await save(),
      b = await save(c, a.id);
    assert.equal(a.status, "draft");
    assert.equal(b.revision, 2);
    await db.query("select set_training_plan_status($1,$2,'active')", [
      c,
      a.id,
    ]);
    await db.query("select set_training_plan_status($1,$2,'active')", [
      c,
      b.id,
    ]);
    assert.equal(
      (
        await db.query(
          "select count(*)::int as n from training_plans where client_id=$1 and status='active'",
          [c],
        )
      ).rows[0].n,
      1,
    );
    await assert.rejects(
      () =>
        db.query("update training_plans set status='active' where id=$1", [
          a.id,
        ]),
      /duplicate key/,
    );
    await assert.rejects(
      () =>
        db.query("update training_plans set program=$1::jsonb where id=$2", [
          JSON.stringify({ tampered: true }),
          a.id,
        ]),
      /immutable/,
    );
    await assert.rejects(() => save(other, a.id), /not owned/);
    await assert.rejects(
      () =>
        db.query("select set_training_plan_status($1,$2,'active')", [
          other,
          a.id,
        ]),
      /not owned/,
    );
    const input = {
      id: "00000000-0000-4000-8000-000000000003",
      client_id: c,
      plan_id: a.id,
      session_id: "session",
      performedAt: "2026-11-06",
      status: "in_progress",
      sets: [
        {
          exerciseId: "exercise",
          setNumber: 1,
          reps: null,
          load: null,
          loadUnit: "bodyweight",
          completed: false,
        },
      ],
      rpe: null,
      notes: "",
    };
    const workout = async (w) =>
      (
        await db.query("select save_training_workout($1::jsonb) as workout", [
          JSON.stringify(w),
        ])
      ).rows[0].workout;
    const first = await workout(input);
    const retried = await workout(input);
    assert.equal(first.id, retried.id);
    assert.deepEqual(first.prescription, program.sessions[0]);
    assert.equal(
      (await db.query("select count(*)::int as n from training_workouts"))
        .rows[0].n,
      1,
    );
    await assert.rejects(
      () => workout({ ...input, client_id: other }),
      /not owned|mismatch/,
    );
    await assert.rejects(
      () => workout({ ...input, plan_id: b.id }),
      /mismatch/,
    );
    await assert.rejects(
      () => workout({ ...input, status: "completed" }),
      /account/,
    );
    const completed = {
      ...input,
      status: "completed",
      sets: [1, 2].map((setNumber) => ({
        exerciseId: "exercise",
        setNumber,
        reps: 8,
        load: null,
        loadUnit: "bodyweight",
        completed: true,
      })),
    };
    assert.equal((await workout(completed)).status, "completed");
    assert.equal((await workout(input)).status, "in_progress");
    await assert.rejects(
      () => workout({ ...input, sets: [input.sets[0], input.sets[0]] }),
      /Duplicate/,
    );
    assert.equal(
      (
        await db.query(
          "select has_function_privilege('anon','save_training_workout(jsonb)','EXECUTE') as allowed",
        )
      ).rows[0].allowed,
      false,
    );
    assert.equal(
      (
        await db.query(
          "select has_table_privilege('authenticated','training_plans','SELECT') as allowed",
        )
      ).rows[0].allowed,
      false,
    );
    assert.equal(
      (
        await db.query(
          "select has_function_privilege('service_role','save_training_plan(uuid,jsonb,jsonb,uuid)','EXECUTE') as allowed",
        )
      ).rows[0].allowed,
      true,
    );
    await db.query("delete from clients where id=$1", [c]);
    assert.equal(
      (await db.query("select count(*)::int as n from training_plans")).rows[0]
        .n,
      0,
    );
    assert.equal(
      (await db.query("select count(*)::int as n from training_workouts"))
        .rows[0].n,
      0,
    );
  } finally {
    await db.close();
  }
});
