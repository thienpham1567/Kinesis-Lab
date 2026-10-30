// Publish only the private answer object; never rewrite the original exam or images.
// node --env-file=.env.local --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/ncsf-mock-answer-upload.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parseNcsfMockExams } from "../src/lib/ncsf-mock-exams.ts";
import { parseMockAnswerKey, prepareMockPractice } from "../src/lib/ncsf-mock-answers.ts";

const root = path.resolve(".data/ncsf");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const [body, bankBytes, manifestBytes] = await Promise.all([
  readFile(path.join(root, "mock-answers.json")),
  readFile(path.join(root, "mock-exams.json")),
  readFile(path.join(root, "mock-answers-manifest.json")),
]);
const bank = parseNcsfMockExams(JSON.parse(bankBytes));
const answers = parseMockAnswerKey(JSON.parse(body));
const manifest = JSON.parse(manifestBytes);
assert.ok(bank && answers && prepareMockPractice(bank, answers), "Invalid or stale private answer key");
assert.equal(hash(body), manifest.answerSha256);
assert.equal(hash(bankBytes), manifest.sourceBankSha256);
assert.equal(manifest.clarified, 22);
assert.equal(manifest.qualified, 111);
assert.equal(manifest.official, false);
assert.equal(manifest.checkedAt, answers.checkedAt);
const records = answers.exams.flatMap((exam) => exam.answers);
assert.equal(records.filter((answer) => answer.correction).length, manifest.clarified);
assert.equal(records.filter((answer) => answer.qualified).length, manifest.qualified);
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
assert.ok(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY, "Missing storage configuration");
const storage = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
}).storage;
const bucket = await storage.getBucket("ncsf");
assert.ok(bucket.data && !bucket.error && !bucket.data.public, "Existing private bucket required");
const objects = storage.from("ncsf");
const download = async (key) => {
  const result = await objects.download(key);
  assert.ok(result.data && !result.error, `Cannot verify private object: ${key}`);
  return Buffer.from(await result.data.arrayBuffer());
};
assert.equal(hash(await download("mock-exams.json")), manifest.sourceBankSha256);
const list = await objects.list("", { search: "mock-answers.json", limit: 1000 });
assert.ok(list.data && !list.error, "Cannot inspect existing private key");
const previousExists = list.data.some((item) => item.name === "mock-answers.json");
const previous = previousExists ? await download("mock-answers.json") : null;
const release = path.join(root, "releases", `mock-answers-${new Date().toISOString().replaceAll(":", "-")}`);
await mkdir(release, { recursive: true });
if (previous) await writeFile(path.join(release, "previous-mock-answers.json"), previous);
await writeFile(path.join(release, "mock-answers.json"), body);
await writeFile(path.join(release, "manifest.json"), manifestBytes);
// Detect another author publishing between backup and upload rather than replacing it.
if (previous) assert.equal(hash(await download("mock-answers.json")), hash(previous));
let uploaded = false;
try {
  const put = await objects.upload("mock-answers.json", body, {
    contentType: "application/json",
    upsert: previousExists,
    cacheControl: "0",
  });
  assert.ifError(put.error);
  uploaded = true;
  assert.equal(hash(await download("mock-answers.json")), hash(body), "Answer upload verification failed");
  assert.equal(hash(await download("mock-exams.json")), manifest.sourceBankSha256, "Original source bank changed");
} catch (error) {
  if (uploaded) {
    if (previous) {
      const restored = await objects.upload("mock-answers.json", previous, {
        contentType: "application/json",
        upsert: true,
        cacheControl: "0",
      });
      assert.ifError(restored.error);
      assert.equal(hash(await download("mock-answers.json")), hash(previous), "Rollback verification failed");
    } else {
      const removed = await objects.remove(["mock-answers.json"]);
      assert.ifError(removed.error);
    }
  }
  throw error;
}
const result = {
  publishedAt: new Date().toISOString(),
  privateBucket: true,
  verified: true,
  answerSha256: hash(body),
  sourceBankSha256: manifest.sourceBankSha256,
  questions: 300,
  clarified: manifest.clarified,
  qualified: manifest.qualified,
  previousExists,
};
await writeFile(path.join(release, "release.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
