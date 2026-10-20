import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { createServer } from "node:http";

// Compile an isolated fixture. Never load or mutate the workspace's .data store.
const repo = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pt-training-log-"));
const previousEnv = [process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY];
let databaseFixture;
const files = ["src/lib/training-log.ts", "src/lib/local-store.ts", "src/lib/supabase/server.ts", "src/lib/clinical/muscle-hypertrophy-atlas.ts", "src/app/api/training-log/route.ts"];
const fixture = {
  clients: [{ id: "client-a", name: "Fixture A" }, { id: "client-b", name: "Fixture B" }],
  biomarkers: [{ id: "original-marker" }], documents: [{ id: "original-document" }],
  future_extension: { preserve: true },
};
try {
  for (const file of files) {
    assert.ok(fs.existsSync(path.join(repo, file)), `Training log implementation missing: ${file}`);
    const compiled = ts.transpileModule(fs.readFileSync(path.join(repo, file), "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText.replace(/(["'])@\/([^"']+)\1/g, (_, quote, target) => `${quote}${pathToFileURL(path.join(temp, "src", `${target}.mjs`)).href}${quote}`);
    const output = path.join(temp, file.replace(/\.ts$/, ".mjs"));
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, compiled);
  }
  fs.symlinkSync(path.join(repo, "node_modules"), path.join(temp, "node_modules"), "dir");
  fs.mkdirSync(path.join(temp, ".data"));
  const storePath = path.join(temp, ".data/clinical-store.json");
  fs.writeFileSync(storePath, JSON.stringify(fixture));
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.chdir(temp);
  const { validateTrainingInput } = await import(pathToFileURL(path.join(temp, "src/lib/training-log.mjs")));
  const { HYPERTROPHY_EXERCISES } = await import(pathToFileURL(path.join(temp, "src/lib/clinical/muscle-hypertrophy-atlas.mjs")));
  const { GET, POST, DELETE } = await import(pathToFileURL(path.join(temp, "src/app/api/training-log/route.mjs")));
  const input = { client_id: "client-a", recorded_at: "2026-10-20", exercise_id: HYPERTROPHY_EXERCISES[0].id, sets: 3, reps: 8, load: 20, load_unit: "kg", rpe: 7.5, feedback: "Fixture only" };
  const post = (body) => POST(new Request("http://fixture/api/training-log", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }));
  const get = (client) => GET(new Request(`http://fixture/api/training-log?client_id=${client}`));
  const remove = (client, id) => DELETE(new Request(`http://fixture/api/training-log?client_id=${client}&id=${id}`, { method: "DELETE" }));
  assert.deepEqual(validateTrainingInput(input), input);
  for (const patch of [
    { client_id: null }, { client_id: "../../private" }, { recorded_at: "2026-02-30" }, { recorded_at: "0000-01-01" }, { recorded_at: "20/10/2026" },
    { exercise_id: "made-up-exercise" }, { sets: 0 }, { sets: 1.5 }, { reps: -1 }, { reps: "8" },
    { load: Infinity }, { load: NaN }, { load: -1 }, { load_unit: "lbs" }, { load_unit: "bodyweight", load: 20 },
    { rpe: 10.1 }, { rpe: -1 }, { rpe: "7" }, { feedback: "x".repeat(2001) }, { feedback: {} },
  ]) assert.throws(() => validateTrainingInput({ ...input, ...patch }), `Reject ${JSON.stringify(patch)}`);
  assert.equal(validateTrainingInput({ ...input, load_unit: "bodyweight", load: null, rpe: null }).load, null);
  assert.equal(validateTrainingInput({ ...input, load_unit: "assisted" }).load_unit, "assisted");
  assert.equal(validateTrainingInput({ ...input, rpe: 0 }).rpe, 0);
  assert.equal(validateTrainingInput({ ...input, rpe: 10 }).rpe, 10);
  assert.equal((await post({ ...input, sets: 0 })).status, 400);
  assert.equal((await POST(new Request("http://fixture/api/training-log", { method: "POST", body: "{invalid" }))).status, 400);
  assert.equal((await post({ ...input, client_id: "missing-client" })).status, 404);
  assert.equal((await get("missing-client")).status, 404);
  assert.equal((await GET(new Request("http://fixture/api/training-log"))).status, 400);
  process.env.SUPABASE_URL = "https://fixture.invalid";
  assert.equal((await get("client-a")).status, 503, "Partial Supabase configuration must not silently use local data");
  assert.equal((await post(input)).status, 503);
  assert.equal(fs.readFileSync(storePath, "utf8"), JSON.stringify(fixture));
  delete process.env.SUPABASE_URL;
  const response = await post(input);
  assert.equal(response.status, 201);
  const { record } = await response.json();
  assert.ok(record.id);
  assert.ok(record.created_at);
  assert.equal(record.client_id, "client-a");
  assert.deepEqual((await (await get("client-a")).json()).records, [record]);
  assert.deepEqual((await (await get("client-b")).json()).records, []);
  assert.equal((await remove("client-b", record.id)).status, 404);
  assert.equal((await (await get("client-a")).json()).records.length, 1);
  const saved = JSON.parse(fs.readFileSync(storePath, "utf8"));
  assert.deepEqual(saved.training_records, [record], "Records persist on disk, independent of React/API memory");
  assert.deepEqual(saved.clients, fixture.clients);
  assert.deepEqual(saved.biomarkers, fixture.biomarkers);
  assert.deepEqual(saved.documents, fixture.documents);
  assert.deepEqual(saved.future_extension, fixture.future_extension);
  // A second import simulates a new server module reading the durable store.
  const fresh = await import(`${pathToFileURL(path.join(temp, "src/app/api/training-log/route.mjs")).href}?reload`);
  assert.deepEqual((await (await fresh.GET(new Request("http://fixture/api/training-log?client_id=client-a"))).json()).records, [record]);
  assert.equal((await remove("client-a", record.id)).status, 200);
  assert.deepEqual((await (await get("client-a")).json()).records, []);
  assert.deepEqual(JSON.parse(fs.readFileSync(storePath, "utf8")).training_records, []);
  // A corrupt file must produce an explicit error without overwriting it with demos.
  fs.writeFileSync(storePath, "{broken");
  assert.equal((await get("client-a")).status, 500);
  assert.equal((await post(input)).status, 500);
  assert.equal(fs.readFileSync(storePath, "utf8"), "{broken");
  fs.writeFileSync(storePath, JSON.stringify({ ...fixture, training_records: {} }));
  assert.equal((await get("client-a")).status, 500);
  // Exercise the real Supabase REST client against a local fake server, with no hosted credentials.
  const remoteClient = "11111111-1111-4111-8111-111111111111";
  const otherRemoteClient = "22222222-2222-4222-8222-222222222222";
  let schemaExists = false;
  let remoteRecords = [];
  databaseFixture = createServer(async (req, res) => {
    const url = new URL(req.url, "http://fixture");
    res.setHeader("Content-Type", "application/json");
    if (url.pathname === "/rest/v1/clients") {
      const exists = [remoteClient, otherRemoteClient].includes(url.searchParams.get("id")?.slice(3));
      res.end(JSON.stringify(exists ? [{ id: url.searchParams.get("id").slice(3) }] : []));
    } else if (url.pathname === "/rest/v1/training_records") {
      if (!schemaExists) {
        res.statusCode = 404;
        res.end(JSON.stringify({ code: "PGRST205", message: "Could not find the table 'public.training_records' in the schema cache" }));
      } else if (req.method === "POST") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const entry = { ...JSON.parse(body), id: "33333333-3333-4333-8333-333333333333", created_at: "2026-10-20T00:00:00Z" };
        remoteRecords.push(entry);
        res.statusCode = 201;
        res.end(JSON.stringify(entry));
      } else {
        const scoped = remoteRecords.filter((entry) => `eq.${entry.client_id}` === url.searchParams.get("client_id") && (!url.searchParams.has("id") || `eq.${entry.id}` === url.searchParams.get("id")));
        if (req.method === "DELETE") remoteRecords = remoteRecords.filter((entry) => !scoped.includes(entry));
        res.end(JSON.stringify(scoped));
      }
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Unexpected fixture route" }));
    }
  });
  await new Promise((resolve) => databaseFixture.listen(0, "127.0.0.1", resolve));
  process.env.SUPABASE_URL = `http://127.0.0.1:${databaseFixture.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fixture-key-only";
  assert.equal((await get(remoteClient)).status, 503);
  const missingTable = await post({ ...input, client_id: remoteClient });
  assert.equal(missingTable.status, 503);
  assert.match((await missingTable.json()).error, /003_training_records\.sql/);
  assert.equal((await remove(remoteClient, "33333333-3333-4333-8333-333333333333")).status, 503);
  assert.equal((await get("client-a")).status, 400, "Invalid Supabase UUID is rejected before querying the DB");
  schemaExists = true;
  const remoteSaved = await post({ ...input, client_id: remoteClient });
  assert.equal(remoteSaved.status, 201);
  const remoteRecord = (await remoteSaved.json()).record;
  assert.deepEqual((await (await get(remoteClient)).json()).records, [remoteRecord]);
  assert.deepEqual((await (await get(otherRemoteClient)).json()).records, []);
  assert.equal((await remove(otherRemoteClient, remoteRecord.id)).status, 404);
  assert.equal((await (await get(remoteClient)).json()).records.length, 1);
  assert.equal((await remove(remoteClient, remoteRecord.id)).status, 200);
  assert.deepEqual((await (await get(remoteClient)).json()).records, []);
  assert.deepEqual(JSON.parse(fs.readFileSync(storePath, "utf8")), { ...fixture, training_records: {} }, "Supabase operation must never fall back to a local store");
  console.log("Training log validation, API errors, client isolation, old-store migration, disk persistence, deletion and corrupt-store preservation passed (temporary fixture only). Supabase REST fixture: missing-schema errors, configured persistence/isolation/delete and no local fallback passed.");
} finally {
  if (databaseFixture) await new Promise((resolve) => databaseFixture.close(resolve));
  process.chdir(repo);
  for (const [key, value] of [["SUPABASE_URL", previousEnv[0]], ["SUPABASE_SERVICE_ROLE_KEY", previousEnv[1]]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  fs.rmSync(temp, { recursive: true, force: true });
}
