// Consume authorized, read-only DOM exports and pageAssets bundles. Licensed data stays ignored.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import {
  parseNcsfMockExams,
  mockImageKey,
  NCSF_MOCK_SOURCES,
} from "../src/lib/ncsf-mock-exams.ts";
const root = path.resolve(".data/ncsf");
const checkedAt = process.argv[2];
assert.match(checkedAt ?? "", /^\d{4}-\d{2}-\d{2}$/);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const norm = (s) => s.normalize("NFC").replace(/\s+/gu, " ").trim();
const bank = { version: 1, checkedAt, exams: [] };
const manifest = {
  checkedAt,
  sources: NCSF_MOCK_SOURCES,
  comparisons: [],
  images: [],
};
await mkdir(path.join(root, "mock-exams"), { recursive: true });
for (const id of [1, 2]) {
  const live = JSON.parse(
    await readFile(
      path.join(root, "exams", `live-exam${id}-dom-${checkedAt}.json`),
      "utf8",
    ),
  );
  const snapshot = JSON.parse(
    await readFile(path.join(root, "exams", `exam${id}.json`), "utf8"),
  );
  assert.equal(live.length, 150);
  assert.equal(snapshot.length, 150);
  let assets = [];
  if (live.some((q) => q.images.length)) {
    const bundle = JSON.parse(
      await readFile(
        path.join(root, "exams", `live-exam${id}-assets-${checkedAt}.json`),
        "utf8",
      ),
    );
    assert.equal(bundle.failures.length, 0);
    assets = bundle.assets;
  }
  const questions = [];
  for (const [i, q] of live.entries()) {
    assert.equal(q.position, i + 1);
    assert.equal(
      norm(q.title),
      norm(snapshot[i].title),
      `Changed source title: ${id}/${i + 1}`,
    );
    assert.deepEqual(
      q.options.map(norm),
      snapshot[i].options.map(norm),
      `Changed source choices: ${id}/${i + 1}`,
    );
    const images = [];
    for (const [j, image] of q.images.entries()) {
      const asset = assets.find((a) => a.url === image.url);
      assert.ok(asset, `Missing image: ${id}/${i + 1}/${j + 1}`);
      assert.equal(asset.contentType, "image/png");
      const bytes = await readFile(asset.path);
      assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      const width = bytes.readUInt32BE(16),
        height = bytes.readUInt32BE(20);
      const key = mockImageKey(id, i + 1, j + 1);
      await copyFile(asset.path, path.join(root, key));
      images.push({ index: j + 1, alt: image.alt, width, height });
      manifest.images.push({
        key,
        sha256: sha(bytes),
        bytes: bytes.length,
        sourceUrl: image.url,
        width,
        height,
      });
    }
    questions.push({
      position: i + 1,
      title: q.title,
      options: q.options,
      images,
    });
  }
  bank.exams.push({ id, questions });
  manifest.comparisons.push({
    id,
    titlesMatched: 150,
    choicesMatched: 150,
    snapshot: `exam${id}.json`,
  });
}
assert.ok(parseNcsfMockExams(bank));
const bytes = JSON.stringify(bank, null, 2) + "\n";
manifest.bankSha256 = sha(bytes);
await writeFile(path.join(root, "mock-exams.json"), bytes);
await writeFile(
  path.join(root, "mock-exams", "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    exams: bank.exams.map((e) => ({ id: e.id, questions: e.questions.length })),
    images: manifest.images.length,
    bankSha256: manifest.bankSha256,
  }),
);
