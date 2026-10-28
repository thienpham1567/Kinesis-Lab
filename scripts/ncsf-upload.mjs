// Uploads quiz/figures from git-ignored .data/ncsf/ to the
// PRIVATE Supabase bucket "ncsf". Run: node --env-file=.env.local scripts/ncsf-upload.mjs
// Re-run after editing .data/ncsf/quiz/*.json to publish quiz changes (upsert).
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
const storage = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).storage;
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.data/ncsf");
const BUCKET = "ncsf";
// Existing PDF objects remain unchanged unless explicitly bootstrapping a new bucket.
const includePdfs = process.argv.includes("--include-pdfs");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

// Refuse to publish malformed data or figures. These do not establish medical accuracy.
for (const script of ["check-ncsf-quiz.mjs", "ncsf-coverage.mjs", "ncsf-figures.mjs"])
  execFileSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(dir, "../../scripts", script)], { stdio: "inherit" });

const { data: bucket } = await storage.getBucket(BUCKET);
if (!bucket) {
  const { error } = await storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
  console.log("created private bucket", BUCKET);
} else if (bucket.public) throw new Error(`Bucket "${BUCKET}" is public — make it private first.`);

const release = path.join(dir, "releases", new Date().toISOString().replaceAll(":", "-"));
mkdirSync(release, { recursive: true });
const { data: previous, error: previousError } = await storage.from(BUCKET).download("quiz.json");
if (previousError && bucket) throw new Error(`Cannot back up current quiz: ${previousError.message}`);
if (previous) writeFileSync(path.join(release, "previous-quiz.json"), Buffer.from(await previous.arrayBuffer()));

const put = async (name, body, contentType) => {
  const { error } = await storage.from(BUCKET).upload(name, body, { contentType, upsert: true });
  if (error) throw new Error(`${name}: ${error.message}`);
  const { data: check, error: checkError } = await storage.from(BUCKET).download(name);
  if (checkError || !check || hash(Buffer.from(await check.arrayBuffer())) !== hash(body)) throw new Error(`${name}: uploaded bytes could not be verified`);
  console.log("uploaded", name, `${(body.length / 1e6).toFixed(1)} MB`);
};

if (includePdfs)
  for (const f of readdirSync(dir).filter((f) => /^\d\d-.*\.pdf$/.test(f)).sort()) await put(f, readFileSync(path.join(dir, f)), "application/pdf");
const figures = JSON.parse(readFileSync(path.join(dir, "figures/manifest.json"), "utf8"));
for (const figure of figures) await put(figure.key, readFileSync(path.join(dir, figure.key)), "image/png");
const chapters = [1, 2, 3, 4, 5, 6, 7, 8].map((ch) => ({ ch, questions: JSON.parse(readFileSync(path.join(dir, `quiz/ch${ch}.json`), "utf8")) }));
const payload = Buffer.from(JSON.stringify({ chapters }));
writeFileSync(path.join(release, "quiz.json"), payload);
// Publish the bank last, after every referenced figure is present and verified.
await put("quiz.json", payload, "application/json");
writeFileSync(path.join(release, "release.json"), JSON.stringify({ publishedAt: new Date().toISOString(), quizSha256: hash(payload), questionCount: chapters.reduce((n,c)=>n+c.questions.length,0), figures: figures.map(f=>({key:f.key,sha256:f.sha256})), privateBucket:true },null,2));
