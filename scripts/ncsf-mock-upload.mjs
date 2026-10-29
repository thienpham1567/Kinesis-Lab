// Upload only the licensed mock exams to the existing PRIVATE bucket.
// node --env-file=.env.local --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/ncsf-mock-upload.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  parseNcsfMockExams,
  mockImageKey,
} from "../src/lib/ncsf-mock-exams.ts";
const root = path.resolve(".data/ncsf");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const bytes = await readFile(path.join(root, "mock-exams.json"));
const bank = parseNcsfMockExams(JSON.parse(bytes));
assert.ok(bank, "Invalid mock bank");
const manifest = JSON.parse(
  await readFile(path.join(root, "mock-exams/manifest.json"), "utf8"),
);
assert.equal(hash(bytes), manifest.bankSha256);
const images = [];
for (const exam of bank.exams)
  for (const q of exam.questions)
    for (const image of q.images) {
      const key = mockImageKey(exam.id, q.position, image.index);
      const record = manifest.images.find((i) => i.key === key);
      assert.ok(record, `Missing image manifest: ${key}`);
      const body = await readFile(path.join(root, key));
      assert.equal(hash(body), record.sha256);
      assert.equal(body.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(body.readUInt32BE(16), image.width);
      assert.equal(body.readUInt32BE(20), image.height);
      images.push({ key, body, sha256: record.sha256 });
    }
assert.equal(images.length, manifest.images.length);
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
assert.ok(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY,
  "Missing storage configuration",
);
const storage = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
}).storage;
const { data: bucket, error: bucketError } = await storage.getBucket("ncsf");
assert.ok(
  !bucketError && bucket && !bucket.public,
  "Existing private bucket required",
);
const release = path.join(
  root,
  "releases",
  `mock-${new Date().toISOString().replaceAll(":", "-")}`,
);
await mkdir(release, { recursive: true });
const { data: objects, error: listError } = await storage
  .from("ncsf")
  .list("", { search: "mock-exams.json" });
assert.ifError(listError);
const previousExists = objects.some((o) => o.name === "mock-exams.json");
if (previousExists) {
  const { data, error } = await storage
    .from("ncsf")
    .download("mock-exams.json");
  assert.ok(data && !error, "Previous bank backup failed");
  await writeFile(
    path.join(release, "previous-mock-exams.json"),
    Buffer.from(await data.arrayBuffer()),
  );
  // Back up every image that this release will replace before any upload.
  for (const image of images) {
    const old = await storage.from("ncsf").download(image.key);
    assert.ok(
      old.data && !old.error,
      `Previous image backup failed: ${image.key}`,
    );
    await mkdir(path.join(release, "previous-images"), { recursive: true });
    await writeFile(
      path.join(release, "previous-images", path.basename(image.key)),
      Buffer.from(await old.data.arrayBuffer()),
    );
  }
}
const put = async (key, body, contentType) => {
  const { error } = await storage
    .from("ncsf")
    .upload(key, body, { contentType, upsert: true });
  assert.ifError(error);
  const check = await storage.from("ncsf").download(key);
  assert.ok(check.data && !check.error, `Cannot verify ${key}`);
  assert.equal(
    hash(Buffer.from(await check.data.arrayBuffer())),
    hash(body),
    `Hash mismatch ${key}`,
  );
};
for (const image of images) await put(image.key, image.body, "image/png");
await put("mock-exams.json", bytes, "application/json");
await writeFile(path.join(release, "mock-exams.json"), bytes);
const result = {
  publishedAt: new Date().toISOString(),
  privateBucket: true,
  bankSha256: hash(bytes),
  questions: bank.exams.map((e) => ({ id: e.id, count: e.questions.length })),
  images: images.map(({ key, sha256 }) => ({ key, sha256 })),
  previousExists,
};
await writeFile(
  path.join(release, "release.json"),
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify({
    release,
    questions: 300,
    images: images.length,
    privateBucket: true,
    verified: true,
  }),
);
