// Checks NCSF quiz bookkeeping against the local textbook text in .data/ncsf:
// every evidence quote exists on its cited page, options/answers are well-formed,
// and no question repeats another quiz question or the two 150-question practice exams.
// It cannot judge whether a distractor is subtly also correct; that stays a human read.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.data/ncsf");
const norm = (s) => s.normalize("NFC").replace(/[​️]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const words = (s) => new Set(norm(s).replace(/^câu \d+:\s*/, "").split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1));
const jaccard = (a, b) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n / (a.size + b.size - n);
};

const pageFiles = readdirSync(path.join(dir, "pages"));
function pages(ch) {
  const file = pageFiles.find((f) => f.startsWith(`0${ch}-`));
  const map = new Map();
  for (const part of readFileSync(path.join(dir, "pages", file), "utf8").split(/^=== p\.(\d+) ===$/m).slice(1).reduce((acc, x, i, arr) => (i % 2 ? acc : [...acc, [arr[i], arr[i + 1]]]), []))
    map.set(Number(part[0]), norm(part[1]));
  return map;
}

// Text printed inside figures (pdftotext can't read it), transcribed by hand; keyed "ch-page".
const imageNotes = JSON.parse(readFileSync(path.join(dir, "image-notes.json"), "utf8"));

const exams =["exam1.json", "exam2.json"].flatMap((f) => JSON.parse(readFileSync(path.join(dir, "exams", f), "utf8")).map((q) => ({ src: f, text: q.title, set: words(q.title + " " + q.options.join(" ")) })));
const all = [];
const errors = [];
for (const file of readdirSync(path.join(dir, "quiz")).filter((f) => /^ch\d\.json$/.test(f)).sort()) {
  const ch = Number(file[2]);
  const pg = pages(ch);
  JSON.parse(readFileSync(path.join(dir, "quiz", file), "utf8")).forEach((q, i) => {
    const id = `${file}#${i + 1}`;
    if (q.options.length !== 4 || new Set(q.options.map(norm)).size !== 4) errors.push(`${id}: needs 4 distinct options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${id}: bad answer index`);
    const text = q.source === "image" ? imageNotes[`${ch}-${q.page}`] && norm(imageNotes[`${ch}-${q.page}`]) : pg.get(q.page);
    if (!text) errors.push(`${id}: no ${q.source === "image" ? "image notes" : "page"} for p.${q.page}`);
    else if (!text.includes(norm(q.evidence))) errors.push(`${id}: evidence not on p.${q.page}${q.source === "image" ? " (image)" : ""}: "${q.evidence}"`);
    all.push({ id, ch, q, set: words(q.q + " " + q.options.join(" ")) });
  });
}

for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++)
    if (norm(all[i].q.q) === norm(all[j].q.q) || jaccard(all[i].set, all[j].set) >= 0.5) errors.push(`duplicate: ${all[i].id} ~ ${all[j].id}`);
  for (const e of exams)
    if (jaccard(all[i].set, e.set) >= 0.5) errors.push(`repeats ${e.src}: ${all[i].id} ~ "${e.text.trim()}"`);
}

const positions = [0, 0, 0, 0];
for (const a of all) positions[a.q.answer]++;
console.log(`${all.length} questions; answer positions A/B/C/D = ${positions.join("/")}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("ok");
