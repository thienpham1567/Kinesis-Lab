// Builds .data/ncsf/coverage.md: every learning objective (lesson notes + chapter review lists)
// mapped to the quiz questions / practice-exam questions that test it, or flagged.
// Exits 1 if an objective has no coverage and no recorded reason, or a reference doesn't exist.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../.data/ncsf");
const read = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
const objectives = read("objectives.json");
const map = read("coverage-map.json");
const quiz = Object.fromEntries(
  readdirSync(path.join(dir, "quiz")).filter((f) => /^ch\d\.json$/.test(f)).map((f) => [f[2], read(`quiz/${f}`)]),
);
const examLabels = ["exam1.json", "exam2.json"].map((f) => new Set(read(`exams/${f}`).map((q) => q.title.match(/Câu (\d+)/)?.[1])));

const refs = new Map(objectives.map((o) => [o.id, new Set(Array.isArray(map[o.id]) ? map[o.id] : [])]));
for (const [ch, qs] of Object.entries(quiz)) qs.forEach((q, i) => (q.obj ?? []).forEach((id) => refs.get(id)?.add(`ch${ch}#${i + 1}`)));

const errors = [];
const exists = (r) => {
  const m = r.match(/^ch(\d)#(\d+)$/) ?? r.match(/^E([12])-(\d+)$/);
  if (!m) return false;
  return r.startsWith("ch") ? Number(m[2]) <= (quiz[m[1]]?.length ?? 0) : examLabels[m[1] - 1].has(m[2]);
};

const rows = { quiz: 0, exam: 0, none: 0 };
let md = `# Bảng đối chiếu mục tiêu học tập NCSF CPT\n\nNguồn mục tiêu: \"Ghi chú bài học\" của từng bài + danh sách \"Ôn tập chương\". ` +
  `chN#k = câu k trong bộ đề Chương N của app; E1-k / E2-k = Câu k trong Đề thi thử 150 câu (1)/(2).\n\n`;
let cur = "";
for (const o of objectives) {
  const head = `Chương ${o.ch} — ${o.src === "Ôn tập" ? "Ôn tập chương" : `Bài ${o.src.slice(1)}`}`;
  if (head !== cur) {
    md += `\n## ${head}\n\n| Mã | Mục tiêu | Câu hỏi |\n|---|---|---|\n`;
    cur = head;
  }
  const r = [...refs.get(o.id)];
  r.filter((x) => !exists(x)).forEach((x) => errors.push(`${o.id}: unknown ref ${x}`));
  let cell;
  if (r.some((x) => x.startsWith("ch"))) {
    cell = r.join(", ");
    rows.quiz++;
  } else if (r.length) {
    cell = `${r.join(", ")} (chỉ trong đề thử)`;
    rows.exam++;
  } else if (typeof map[o.id] === "string") {
    cell = `— ${map[o.id].replace(/^none:\s*/, "")}`;
    rows.none++;
  } else errors.push(`${o.id}: no coverage and no reason`);
  md += `| ${o.id} | ${o.text.replace(/\|/g, "/")} | ${cell ?? "**THIẾU**"} |\n`;
}
md = md.replace("\n\n\n", `\n\n**Tổng:** ${objectives.length} mục tiêu — ${rows.quiz} có câu trong bộ đề app, ${rows.exam} chỉ có trong đề thử, ${rows.none} không có nội dung trong sách để hỏi.\n\n\n`);
writeFileSync(path.join(dir, "coverage.md"), md);
console.log(`${objectives.length} objectives: ${rows.quiz} in app quiz, ${rows.exam} exam-only, ${rows.none} no textbook content`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
