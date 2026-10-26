import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { createAppLoader } from "./lib/load-app-module.mjs";

const load = createAppLoader({ globals: { Buffer, crypto } });
const jobs = load("src/lib/chat/image-jobs.ts");

function input(owner, extra = {}) {
  return {
    requestId: randomUUID(),
    ownerHash: owner,
    fingerprint: extra.fingerprint ?? "fp-a",
    conversationId: extra.conversationId ?? randomUUID(),
    sourceMessageId: extra.sourceMessageId ?? randomUUID(),
    ...extra,
  };
}

test("dev job store works without supabase", async () => {
  const row = await jobs.jobStore().claim(input("local-dev"));
  assert.equal(row.kind, "claimed");
});

test("two adapters sharing one ledger grant a single claim", async () => {
  const ledger = jobs.createMemoryJobLedger();
  const a = jobs.memoryJobStore(ledger);
  const b = jobs.memoryJobStore(ledger);
  const req = input("owner-1");
  const first = a.claim(req);
  const second = b.claim(req);
  const results = await Promise.all([first, second]);
  const kinds = results.map((row) => row.kind).sort();
  assert.deepEqual(kinds, ["claimed", "existing"]);
});

test("same id with a different fingerprint is 409 and other owners cannot read", async () => {
  const store = jobs.memoryJobStore(jobs.createMemoryJobLedger());
  const req = input("owner-1");
  assert.equal((await store.claim(req)).kind, "claimed");
  const conflict = await store.claim({ ...req, fingerprint: "fp-b" });
  assert.equal(conflict.kind, "conflict");
  assert.equal(await store.get(req.requestId, "owner-2"), null);
  assert.equal((await store.get(req.requestId, "owner-1"))?.id, req.requestId);
});

test("enforces two concurrent jobs, 30 global per hour and 5 per session", async () => {
  const store = jobs.memoryJobStore(jobs.createMemoryJobLedger());
  const one = await store.claim(input("o1", { fingerprint: "1" }));
  const two = await store.claim(input("o2", { fingerprint: "2" }));
  assert.equal(one.kind, "claimed");
  assert.equal(two.kind, "claimed");
  assert.equal((await store.claim(input("o3", { fingerprint: "3" }))).kind, "busy");
  await store.update(one.job.id, one.job.ownerHash, { state: "succeeded" });
  await store.update(two.job.id, two.job.ownerHash, { state: "succeeded" });
  for (let i = 0; i < 5; i++) {
    const row = await store.claim(input("session", { fingerprint: `s${i}` }));
    assert.equal(row.kind, "claimed");
    await store.update(row.job.id, row.job.ownerHash, { state: "succeeded" });
  }
  const sixth = await store.claim(input("session", { fingerprint: "s5" }));
  assert.equal(sixth.kind, "rate-limited");
  assert.equal(sixth.scope, "session");
  const globalStore = jobs.memoryJobStore(jobs.createMemoryJobLedger());
  for (let i = 0; i < 30; i++) {
    const row = await globalStore.claim(input(`g${i}`, { fingerprint: `g${i}` }));
    assert.equal(row.kind, "claimed");
    await globalStore.update(row.job.id, row.job.ownerHash, { state: "failed" });
  }
  const over = await globalStore.claim(input("gx", { fingerprint: "gx" }));
  assert.equal(over.kind, "rate-limited");
  assert.equal(over.scope, "global");
});
