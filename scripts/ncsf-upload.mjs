// Uploads the NCSF CPT PDFs and the combined quiz from git-ignored .data/ncsf/ to the
// PRIVATE Supabase bucket "ncsf". Run: node --env-file=.env.local scripts/ncsf-upload.mjs
// Re-run after editing .data/ncsf/quiz/*.json to publish quiz changes (upsert).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
const storage = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).storage;
const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.data/ncsf");
const BUCKET = "ncsf";

const { data: bucket } = await storage.getBucket(BUCKET);
if (!bucket) {
  const { error } = await storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
  console.log("created private bucket", BUCKET);
} else if (bucket.public) throw new Error(`Bucket "${BUCKET}" is public — make it private first.`);

const put = async (name, body, contentType) => {
  const { error } = await storage.from(BUCKET).upload(name, body, { contentType, upsert: true });
  if (error) throw new Error(`${name}: ${error.message}`);
  console.log("uploaded", name, `${(body.length / 1e6).toFixed(1)} MB`);
};

for (const f of readdirSync(dir).filter((f) => /^\d\d-.*\.pdf$/.test(f)).sort()) await put(f, readFileSync(path.join(dir, f)), "application/pdf");
const chapters = [1, 2, 3, 4, 5, 6, 7, 8].map((ch) => ({ ch, questions: JSON.parse(readFileSync(path.join(dir, `quiz/ch${ch}.json`), "utf8")) }));
await put("quiz.json", Buffer.from(JSON.stringify({ chapters })), "application/json");
