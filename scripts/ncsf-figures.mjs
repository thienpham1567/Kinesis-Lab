// Read-only PDF rendering into the ignored, private NCSF asset directory.
// No figure or licensed page is copied into public/ or git.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { figureObjectKey } from "../src/lib/ncsf-quiz.ts";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.data/ncsf");
const target = path.join(dir, "figures");
const render = process.argv.includes("--render");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const sources = readdirSync(dir).filter(f => /^0[1-8]-.*\.pdf$/.test(f));
const wanted = new Map();
for (let ch = 1; ch <= 8; ch++) {
  const questions = JSON.parse(readFileSync(path.join(dir, `quiz/ch${ch}.json`), "utf8"));
  for (const q of questions) if (q.figure) {
    const key = figureObjectKey(ch, q.figure.page);
    if (!key) throw new Error(`Invalid figure: chapter ${ch}, page ${q.figure.page}`);
    wanted.set(key, { chapter: ch, page: q.figure.page });
  }
}
if (!wanted.size) throw new Error("No figure stimuli are referenced");
if (render) mkdirSync(target, { recursive: true });
const manifestFile = path.join(target, "manifest.json");
const previous = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : [];
const records = [];
for (const [key, { chapter, page }] of wanted) {
  const pdf = sources.find(f => f.startsWith(`0${chapter}-`));
  if (!pdf) throw new Error(`Missing source PDF for chapter ${chapter}`);
  const sourceSha256 = hash(readFileSync(path.join(dir, pdf)));
  const file = path.join(dir, key);
  const old = previous.find(r => r.key === key);
  if (render && (!existsSync(file) || old?.sourceSha256 !== sourceSha256 || old.sha256 !== hash(readFileSync(file)))) {
    execFileSync("pdftoppm", ["-f", String(page), "-l", String(page), "-singlefile", "-scale-to", "2000", "-png", path.join(dir, pdf), file.slice(0, -4)], { stdio: "pipe" });
  }
  if (!existsSync(file)) throw new Error(`Missing ${key}; run with --render`);
  const bytes = readFileSync(file);
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error(`Invalid PNG ${key}`);
  const record = { key, chapter, page, source: pdf, sourceSha256, sha256: hash(bytes), bytes: bytes.length, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (!render && (!old || old.sourceSha256 !== sourceSha256 || old.sha256 !== record.sha256)) throw new Error(`Stale/unrecorded figure ${key}`);
  records.push(record);
}
if (render) writeFileSync(manifestFile, JSON.stringify(records, null, 2));
console.log(`${records.length} unique private figure pages ${render ? "rendered/verified" : "verified"}; source PDFs unchanged.`);
