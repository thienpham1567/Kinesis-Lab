// Builds expanded answer feedback for the NCSF study-guide bank (Đề cương ôn tập) and the
// two mock exams: a verbatim passage from the cited textbook page, plus AI-drafted reasons
// for the correct option and for every wrong option, grounded on that page only.
// Private inputs and outputs stay in git-ignored .data/ncsf-review/. The drafts are not an
// expert review; output files keep `reviewedBy: null` and name the generating model.
//
//   node --env-file=.env.local scripts/ncsf-answer-review.mjs pull      # bank, keys, textbook PDFs
//   node scripts/ncsf-answer-review.mjs pages                           # extract textbook lines
//   node --env-file=.env.local scripts/ncsf-answer-review.mjs generate  # resumable AI drafts
//   node scripts/ncsf-answer-review.mjs build                           # validate, write out/*.json
//   node --env-file=.env.local scripts/ncsf-answer-review.mjs publish   # upload review/*.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAppLoader } from "./lib/load-app-module.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const dir = path.join(root, ".data/ncsf-review");
const src = (f) => path.join(dir, "sources", f);
const load = createAppLoader();
const { identifyQuizQuestion, identifyMockQuestion } = load("src/lib/learning/ncsf-identity.ts");
const { parseNcsfQuiz, NCSF_PAGE_COUNTS } = load("src/lib/ncsf-quiz.ts");
const { parseNcsfMockExams, mockQuestionText, mockOptionText } = load("src/lib/ncsf-mock-exams.ts");
const { prepareMockPractice } = load("src/lib/ncsf-mock-answers.ts");
const { NCSF_TEXTBOOK_SLUGS, parseAnswerReviewFile, answerReviewErrors, answerReviewKey } =
  load("src/lib/ncsf-answer-review.ts");

const BUCKET = "ncsf";
const MODEL = process.argv.find((a) => a.startsWith("--model="))?.slice(8) ??
  process.env.OPENROUTER_MODEL_CLINICAL ?? "anthropic/claude-haiku-5.5";
const GENERATED_AT = new Date().toISOString().slice(0, 10);
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
const writeJson = (f, v) => { mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(v, null, 1)); };
const sha = (v) => createHash("sha256").update(v).digest("hex");
const norm = (s) => s.normalize("NFC").replace(/[\u200B\uFE0F]/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("vi");

async function storage() {
  const { createClient } = await import("@supabase/supabase-js");
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }).storage.from(BUCKET);
}

async function pull() {
  const bucket = await storage();
  for (const name of ["quiz.json", "mock-exams.json", "mock-answers.json", ...NCSF_TEXTBOOK_SLUGS.map((s) => `${s}.pdf`)]) {
    const { data, error } = await bucket.download(name);
    if (error || !data) throw new Error(`${name}: ${error?.message ?? "missing"}`);
    mkdirSync(path.join(dir, "sources"), { recursive: true });
    writeFileSync(src(name), Buffer.from(await data.arrayBuffer()));
    console.log("pulled", name);
  }
}

// ---- Textbook lines ---------------------------------------------------------------------
const BULLET = /^(?:[●○■▪•◦➢➤✓-]|\d{1,2}[.)]\s)/u;
export function pageUnits(raw) {
  const lines = raw.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (lines.length && /^Chương \d/u.test(lines[0])) lines.shift();
  while (lines.length && (/^NCSF Vietnam$/iu.test(lines.at(-1)) || /^\d{1,3}$/.test(lines.at(-1)))) lines.pop();
  const units = [];
  for (const line of lines) {
    const prev = units.at(-1);
    if (prev !== undefined && !BULLET.test(line) && BULLET.test(prev) && !/[.:!?;]$/u.test(prev)) units[units.length - 1] = `${prev} ${line}`;
    else units.push(line);
  }
  return { section: units.length > 1 && isHeading(units[0]) ? units[0].replace(/:$/u, "") : "", units };
}
// Headings start with a capital letter or digit; lowercase lines are column/wrap fragments.
const isHeading = (unit) => !BULLET.test(unit) && unit.length <= 160 && !/[.;,]$/u.test(unit) && /^[\p{Lu}\d]/u.test(unit);
// The slide title names the section. Lines inside a slide are not used: table rows, lead-in
// phrases and wrapped column fragments are indistinguishable from sub-headings in PDF text.
function sectionFor(pageData, review) {
  const { units } = pageData[review.slug][review.page - 1];
  if (units.length < 2 || !isHeading(units[0])) return "";
  let title = units[0];
  // A slide title wrapped onto two lines leaves an unclosed parenthesis.
  if ((title.match(/\(/g) ?? []).length > (title.match(/\)/g) ?? []).length && !BULLET.test(units[1])) title = `${title} ${units[1]}`;
  title = title.replace(/:$/u, "").trim();
  const words = title.split(/\s+/u);
  const clean = words.length >= 2 && title !== title.toLocaleUpperCase("vi") &&
    (title.match(/\(/g) ?? []).length === (title.match(/\)/g) ?? []).length &&
    !/\s(?:có|và|là|sẽ|của|với|về|vì|cho|the|and|of)$/iu.test(title) &&
    !/Mô tả chức năng|Chức năng vận động|Bài tập minh họa|Fatigue \//u.test(title);
  return clean ? title : "";
}

async function pages() {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const out = {};
  for (const [i, slug] of NCSF_TEXTBOOK_SLUGS.entries()) {
    const pdf = await getDocumentProxy(new Uint8Array(readFileSync(src(`${slug}.pdf`))));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    if (totalPages !== NCSF_PAGE_COUNTS[i]) throw new Error(`${slug}: ${totalPages} pages, expected ${NCSF_PAGE_COUNTS[i]}`);
    out[slug] = text.map((t) => pageUnits(t));
  }
  writeJson(path.join(dir, "pages.json"), out);
  console.log("pages extracted", Object.entries(out).map(([s, p]) => `${s}:${p.length}`).join(" "));
}

// ---- Tasks -----------------------------------------------------------------------------
function lexicalPages(pageData, query, limit = 2) {
  const words = (s) => new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2));
  const q = words(query);
  const docs = [];
  for (const slug of NCSF_TEXTBOOK_SLUGS) pageData[slug].forEach((p, i) => docs.push({ slug, page: i + 1, set: words(p.units.join(" ")) }));
  const df = new Map();
  for (const d of docs) for (const w of d.set) df.set(w, (df.get(w) ?? 0) + 1);
  return docs
    .map((d) => ({ ...d, score: [...q].reduce((s, w) => s + (d.set.has(w) ? Math.log(docs.length / df.get(w)) : 0), 0) }))
    .sort((a, b) => b.score - a.score).slice(0, limit).map(({ slug, page }) => ({ slug, page }));
}

// The cited page first, then up to two other pages of the same chapter that the authored
// explanation names ("trang 14", "trang 18–21").
function quizPages(ch, q) {
  const slug = NCSF_TEXTBOOK_SLUGS[ch - 1];
  const pages = [q.page];
  for (const m of q.explain.matchAll(/trang\s+(\d+)(?:\s*[–-]\s*(\d+))?/giu)) {
    const from = Number(m[1]), to = Math.min(Number(m[2] ?? m[1]), from + 3);
    for (let p = from; p <= to; p++) if (p >= 1 && p <= NCSF_PAGE_COUNTS[ch - 1] && !pages.includes(p)) pages.push(p);
  }
  return pages.slice(0, 3).map((page) => ({ slug, page }));
}

function buildTasks(pageData) {
  const tasks = [];
  const seen = new Set();
  const quiz = parseNcsfQuiz(readJson(src("quiz.json")));
  if (!quiz) throw new Error("Invalid quiz.json");
  for (const chapter of quiz.chapters) chapter.questions.forEach((q, idx) => {
    const id = identifyQuizQuestion(chapter.ch, idx, q);
    const key = `quiz-${chapter.ch}-${id.itemId}`;
    if (seen.has(key)) return;
    seen.add(key);
    tasks.push({
      key, bank: "quiz", part: chapter.ch, itemId: id.itemId, optionIds: id.optionIds,
      stem: q.q, options: q.options, answer: q.answer, explain: q.explain, evidence: q.evidence,
      pages: quizPages(chapter.ch, q),
    });
  });
  const exams = parseNcsfMockExams(readJson(src("mock-exams.json")));
  const practice = exams && prepareMockPractice(exams, readJson(src("mock-answers.json")));
  if (!practice) throw new Error("Invalid mock exams or answer key");
  for (const exam of practice.exams) exam.questions.forEach((q, idx) => {
    const id = identifyMockQuestion(exam.id, idx, q);
    const options = q.options.map(mockOptionText);
    const cited = [];
    for (const s of q.sources) {
      const m = s.url.match(/\/api\/ncsf\/(0[1-8]-[a-z-]+)#page=(\d+)/);
      if (m && NCSF_TEXTBOOK_SLUGS.includes(m[1]) && !cited.some((c) => c.slug === m[1] && c.page === Number(m[2])))
        cited.push({ slug: m[1], page: Number(m[2]) });
    }
    const stem = mockQuestionText(q.title);
    tasks.push({
      key: `mock-${exam.id}-${id.itemId}`, bank: "mock", part: exam.id, itemId: id.itemId, optionIds: id.optionIds,
      stem, options, answer: q.answer, explain: q.explanation, notes: q.notes, evidence: "",
      pages: cited.length ? cited.slice(0, 2) : lexicalPages(pageData, `${stem} ${options[q.answer]} ${q.explanation}`),
      pagesFrom: cited.length ? "answer-key" : "lexical",
    });
  });
  return tasks;
}

// ---- Generation --------------------------------------------------------------------------
const SYSTEM = `Bạn biên soạn phần giải thích đáp án cho học viên huấn luyện viên cá nhân (PT) ôn thi chứng chỉ NCSF CPT bằng tiếng Việt.
Nguồn được phép dùng: (1) các trang giáo trình NCSF được cung cấp, mỗi dòng có mã như "P1-3"; (2) câu hỏi, các phương án và giải thích có sẵn.
Với mỗi câu hỏi, viết:
- "whyCorrect": 2–4 câu giải thích vì sao đáp án đúng: nêu định nghĩa, cơ chế hoặc nguyên tắc trong giáo trình đứng sau đáp án, không chỉ lặp lại đáp án.
- "whyWrong": với MỖI phương án sai (khóa là số thứ tự phương án, ví dụ "2"), 1–3 câu: phương án đó thực chất là gì hoặc mô tả điều gì, và vì sao nó không trả lời đúng câu hỏi. Không viết chung chung kiểu "không đúng", "không liên quan" hay "giáo trình không đề cập"; hãy nêu khái niệm thật của phương án đó và chỉ ra nó khác gì với điều câu hỏi hỏi.
- "concept": 1–2 câu "điều cần nhớ" khái quát kiến thức để làm đúng các câu tương tự.
- "lines": 1–4 mã dòng giáo trình chứa trực tiếp căn cứ cho đáp án, dòng liên quan nhất trước.
- "keyConflict": true nếu giáo trình được cung cấp mâu thuẫn với đáp án được cho là đúng hoặc không có dòng nào hỗ trợ đáp án; khi đó "conflictNote" nêu ngắn lý do. Vẫn giải thích theo đáp án được cho.
Quy tắc bắt buộc:
- Không ghi mã dòng (như "P1-3") hay số trang trong văn bản giải thích; căn cứ chỉ ghi ở trường "lines".
- Không gọi phương án bằng chữ cái (A, B, C, D) hay số thứ tự trong văn bản, vì thứ tự phương án bị xáo trộn khi hiển thị. Nhắc phương án bằng chính nội dung của nó, đặt trong ngoặc kép khi cần.
- Không thêm con số, ngưỡng, tỷ lệ, liều lượng, mốc tuổi hay tên nghiên cứu không xuất hiện trong tài liệu được cung cấp. Có thể dùng định nghĩa nền phổ thông của một thuật ngữ khi giáo trình không nói, nhưng phải chính xác và không kèm số liệu.
- Không chẩn đoán và không đưa lời khuyên điều trị cá nhân.
- Giữ thuật ngữ tiếng Anh trong ngoặc đơn như giáo trình khi hữu ích. Câu hoàn chỉnh, rõ ràng, không dùng markdown hay gạch đầu dòng.
Chỉ trả về một đối tượng JSON: {"items":[{"id":"…","whyCorrect":"…","whyWrong":{"2":"…"},"concept":"…","lines":["P1-3"],"keyConflict":false,"conflictNote":""}]}`;

function promptFor(batch, pageData) {
  const labels = new Map();
  const pageBlocks = [];
  for (const t of batch) for (const p of t.pages) {
    const k = `${p.slug}#${p.page}`;
    if (labels.has(k)) continue;
    const label = `P${labels.size + 1}`;
    labels.set(k, label);
    const data = pageData[p.slug][p.page - 1];
    pageBlocks.push(`[${label}] Giáo trình ${p.slug}, trang ${p.page}${data.section ? ` — mục “${data.section}”` : ""}\n` +
      data.units.map((u, i) => `${label}-${i + 1}: ${u}`).join("\n"));
  }
  const items = batch.map((t) => [
    `id: ${t.key}`,
    `Câu hỏi: ${t.stem}`,
    ...t.options.map((o, i) => `Phương án ${i + 1}${i === t.answer ? " (ĐÚNG)" : ""}: ${o}`),
    `Giải thích có sẵn${t.bank === "mock" ? " (chữ cái theo thứ tự gốc: A=1, B=2, C=3, D=4…)" : ""}: ${t.explain}`,
    t.evidence ? `Câu giáo trình làm căn cứ: ${t.evidence}` : "",
    t.notes ? `Ghi chú phạm vi: ${t.notes}` : "",
    `Trang giáo trình gợi ý: ${t.pages.map((p) => labels.get(`${p.slug}#${p.page}`)).join(", ")}`,
  ].filter(Boolean).join("\n"));
  return { labels, text: `TRANG GIÁO TRÌNH\n\n${pageBlocks.join("\n\n")}\n\nCÂU HỎI\n\n${items.join("\n\n")}` };
}

// Locants inside chemical names (glucose-1-phosphate) are names, not measurements.
const numbers = (s) => new Set((s.replace(/\p{L}-\d+-\p{L}/gu, "").match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")));
const LETTER_REF = /(?:đáp án|phương án|lựa chọn|câu)\s+(?:số\s+)?(?:[A-H]|\d)(?![\p{L}\d])/iu;

function checkDraft(task, draft, labels, pageData) {
  const problems = [];
  if (!draft || typeof draft !== "object") return { problems: ["missing item"] };
  const wrong = task.options.map((_, i) => i).filter((i) => i !== task.answer);
  const whyWrong = {};
  for (const i of wrong) {
    const reason = draft.whyWrong?.[String(i + 1)];
    if (typeof reason !== "string" || reason.trim().length < 20) problems.push(`thiếu lý do cho phương án ${i + 1}`);
    else whyWrong[task.optionIds[i]] = reason.trim();
  }
  const fields = { concept: draft.concept, whyCorrect: draft.whyCorrect };
  for (const [k, v] of Object.entries(fields)) if (typeof v !== "string" || v.trim().length < 20) problems.push(`thiếu ${k}`);
  const written = [draft.concept, draft.whyCorrect, ...Object.values(whyWrong)].filter((v) => typeof v === "string");
  if (written.some((v) => LETTER_REF.test(v))) problems.push("có nhắc phương án bằng chữ cái/số thứ tự");
  if (written.some((v) => /[*#`]|^\s*[-•]/mu.test(v))) problems.push("có markdown");
  const corpus = [task.stem, ...task.options, task.explain, task.evidence, task.notes ?? "",
    ...task.pages.flatMap((p) => pageData[p.slug][p.page - 1].units)].join(" ");
  const allowed = numbers(corpus);
  const extra = [...new Set(written.flatMap((v) => [...numbers(v)]))].filter((n) => !allowed.has(n));
  if (extra.length) problems.push(`có số liệu không có trong tài liệu: ${extra.join(", ")}`);
  // Passage: textbook lines picked by the model, plus the lines holding the quoted evidence.
  const byLabel = new Map([...labels].map(([k, label]) => [label, k]));
  const picked = [];
  for (const ref of Array.isArray(draft.lines) ? draft.lines : []) {
    const m = typeof ref === "string" && ref.match(/^(P\d+)-(\d+)$/);
    const pk = m && byLabel.get(m[1]);
    if (!pk || !task.pages.some((p) => `${p.slug}#${p.page}` === pk)) continue;
    const [slug, page] = pk.split("#");
    const units = pageData[slug][Number(page) - 1].units;
    const index = Number(m[2]) - 1;
    if (units[index]) picked.push({ slug, page: Number(page), index });
  }
  if (task.evidence) {
    const p = task.pages[0];
    const units = pageData[p.slug][p.page - 1].units;
    const ev = norm(task.evidence);
    const head = ev.slice(0, 30);
    units.forEach((u, index) => {
      const nu = norm(u);
      if ((nu.includes(ev) || ev.includes(nu) && nu.length > 15 || nu.includes(head)) && !picked.some((x) => x.slug === p.slug && x.page === p.page && x.index === index))
        picked.unshift({ slug: p.slug, page: p.page, index });
    });
  }
  if (!picked.length) problems.push("không chọn được dòng giáo trình nào");
  const primary = picked[0];
  const onPrimary = picked
    .filter((x) => x.slug === primary?.slug && x.page === primary?.page)
    .sort((a, b) => a.index - b.index);
  const primaryUnits = primary ? pageData[primary.slug][primary.page - 1].units : [];
  // Nearest heading at or above the first cited line names the textbook section.
  const headingIndex = primary ? primaryUnits.findLastIndex((u, i) => i <= onPrimary[0].index && isHeading(u)) : -1;
  const section = headingIndex >= 0 ? primaryUnits[headingIndex].replace(/:$/u, "") : primary ? pageData[primary.slug][primary.page - 1].section : "";
  const passage = onPrimary
    .map((x) => pageData[x.slug][x.page - 1].units[x.index])
    .filter((u, i, all) => all.indexOf(u) === i && u.replace(/:$/u, "") !== section)
    .slice(0, 6);
  // When the cited line is the slide title itself, quote it with the lines it introduces.
  if (primary && !passage.length)
    passage.push(...primaryUnits.slice(onPrimary[0].index, onPrimary[0].index + 3));
  if (primary && !passage.length) problems.push("đoạn trích chỉ có tiêu đề mục");
  const review = primary && {
    slug: primary.slug, page: primary.page, section, passage,
    concept: String(draft.concept ?? "").trim(), whyCorrect: String(draft.whyCorrect ?? "").trim(), whyWrong,
  };
  if (review) problems.push(...answerReviewErrors(review));
  return { problems, review, keyConflict: draft.keyConflict === true, conflictNote: draft.conflictNote ?? "" };
}

async function callModel(messages) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(180000),
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://pt-medical-agent.local",
          "X-Title": "PT Medical Agent",
        },
        body: JSON.stringify({ model: MODEL, messages, max_tokens: 9000, response_format: { type: "json_object" } }),
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`retryable ${res.status}`);
      if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      return JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1));
    } catch (error) {
      if (attempt === 4 || /OpenRouter 4\d\d/.test(String(error))) throw error;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    }
  }
}

const cacheFile = (t) => path.join(dir, "cache", `${t.key}.json`);

async function generate() {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("Thiếu OPENROUTER_API_KEY");
  const pageData = readJson(path.join(dir, "pages.json"));
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.slice(8) ?? Infinity);
  let tasks = buildTasks(pageData).filter((t) => !existsSync(cacheFile(t)) && (!only || t.key.startsWith(only)));
  tasks = tasks.slice(0, limit);
  const groups = new Map();
  for (const t of tasks) {
    const k = t.pages.map((p) => `${p.slug}#${p.page}`).join("|");
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  const batches = [...groups.values()].flatMap((g) => Array.from({ length: Math.ceil(g.length / 4) }, (_, i) => g.slice(i * 4, i * 4 + 4)));
  console.log(`${tasks.length} items in ${batches.length} batches with ${MODEL}`);
  let done = 0, failed = 0;
  const worker = async () => {
    for (let batch = batches.shift(); batch; batch = batches.shift()) {
      let pending = batch;
      const feedback = new Map();
      for (let round = 0; round < 3 && pending.length; round++) {
        const { labels, text } = promptFor(pending, pageData);
        const note = pending.filter((t) => feedback.has(t.key)).map((t) => `- ${t.key}: ${feedback.get(t.key)}`).join("\n");
        let result;
        try {
          result = await callModel([
            { role: "system", content: SYSTEM },
            { role: "user", content: note ? `${text}\n\nLẦN TRƯỚC CÓ LỖI, HÃY SỬA:\n${note}` : text },
          ]);
        } catch (error) {
          console.error("batch error", pending.map((t) => t.key).join(","), String(error).slice(0, 300));
          continue;
        }
        const drafts = new Map((Array.isArray(result?.items) ? result.items : []).map((d) => [d?.id, d]));
        const next = [];
        for (const t of pending) {
          const checked = checkDraft(t, drafts.get(t.key), labels, pageData);
          if (!checked.problems.length) {
            writeJson(cacheFile(t), { key: t.key, model: MODEL, generatedAt: GENERATED_AT, review: checked.review, keyConflict: checked.keyConflict, conflictNote: checked.conflictNote, pagesFrom: t.pagesFrom ?? "question" });
            done++;
          } else {
            feedback.set(t.key, checked.problems.join("; "));
            // Keep the last rejected draft for manual inspection.
            writeJson(path.join(dir, "rejected", `${t.key}.json`), { problems: checked.problems, draft: drafts.get(t.key) ?? null });
            next.push(t);
          }
        }
        pending = next;
      }
      for (const t of pending) {
        failed++;
        console.error("FAILED", t.key, feedback.get(t.key) ?? "no response");
      }
      if ((done + failed) % 40 < 4) console.log(`progress ${done} ok, ${failed} failed`);
    }
  };
  const concurrency = Number(process.argv.find((a) => a.startsWith("--concurrency="))?.slice(14) ?? 6);
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`generated ${done}; failed ${failed}`);
}

function build() {
  const pageData = readJson(path.join(dir, "pages.json"));
  const tasks = buildTasks(pageData);
  const files = new Map();
  const missing = [], conflicts = [], lexical = [];
  const models = new Set();
  for (const t of tasks) {
    const fileKey = `${t.bank}-${t.part}`;
    if (!files.has(fileKey)) files.set(fileKey, { bank: t.bank, part: t.part, items: {}, dates: new Set() });
    if (!existsSync(cacheFile(t))) { missing.push(t.key); continue; }
    const cached = readJson(cacheFile(t));
    const f = files.get(fileKey);
    const section = sectionFor(pageData, cached.review);
    const passage = cached.review.passage.filter((line) => line.replace(/:$/u, "") !== section);
    f.items[t.itemId] = {
      ...cached.review, section, passage: passage.length ? passage : cached.review.passage,
      ...(cached.keyConflict ? { indirect: true } : {}),
    };
    f.dates.add(cached.generatedAt);
    models.add(cached.model);
    if (cached.keyConflict) conflicts.push({ key: t.key, stem: t.stem, answer: t.options[t.answer], note: cached.conflictNote, page: `${cached.review.slug} tr.${cached.review.page}` });
    if (t.pagesFrom === "lexical") lexical.push({ key: t.key, stem: t.stem, page: `${cached.review.slug} tr.${cached.review.page}` });
  }
  const written = [];
  for (const f of files.values()) {
    const file = {
      version: 1, bank: f.bank, part: f.part,
      generatedAt: [...f.dates].sort().at(-1) ?? GENERATED_AT,
      method: "ai-draft-from-textbook-page",
      model: [...models].join(", ") || MODEL,
      reviewedBy: null,
      items: f.items,
    };
    if (!parseAnswerReviewFile(file, { bank: f.bank, part: f.part })) throw new Error(`Invalid review file ${f.bank}-${f.part}`);
    const out = path.join(dir, "out", answerReviewKey(f.bank, f.part));
    writeJson(out, file);
    written.push(`${answerReviewKey(f.bank, f.part)} (${Object.keys(f.items).length})`);
  }
  writeJson(path.join(dir, "report.json"), { builtAt: new Date().toISOString(), total: tasks.length, missing, keyConflicts: conflicts, lexicalPageMatches: lexical });
  console.log(written.join("\n"));
  console.log(`${tasks.length} items; ${missing.length} missing; ${conflicts.length} flagged key conflicts; ${lexical.length} mock items matched to pages lexically. Report: .data/ncsf-review/report.json`);
  if (missing.length) process.exitCode = 1;
}

// Storage calls can fail on a flaky connection; retry each one a few times.
async function retry(fn, label) {
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await fn();
      if (result?.error && attempt < 5) throw result.error;
      return result;
    } catch (error) {
      if (attempt >= 5) throw new Error(`${label}: ${error?.message ?? error}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function publish() {
  const bucket = await storage();
  const release = path.join(dir, "releases", new Date().toISOString().replaceAll(":", "-"));
  mkdirSync(release, { recursive: true });
  for (const bank of ["quiz", "mock"]) for (const part of bank === "quiz" ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2]) {
    const key = answerReviewKey(bank, part);
    const body = readFileSync(path.join(dir, "out", key));
    if (!parseAnswerReviewFile(JSON.parse(body.toString("utf8")), { bank, part })) throw new Error(`${key}: invalid`);
    const { data: previous } = await retry(() => bucket.download(key).then((r) => (r.error?.message?.includes("not found") ? { data: null } : r)), `${key} backup`);
    if (previous) writeFileSync(path.join(release, key.replace("/", "_") + ".previous"), Buffer.from(await previous.arrayBuffer()));
    const { error } = await retry(() => bucket.upload(key, body, { contentType: "application/json", upsert: true }), `${key} upload`);
    if (error) throw new Error(`${key}: ${error.message}`);
    const { data: check, error: checkError } = await retry(() => bucket.download(key), `${key} verify`);
    if (checkError || !check || sha(Buffer.from(await check.arrayBuffer())) !== sha(body)) throw new Error(`${key}: uploaded bytes could not be verified`);
    console.log("uploaded", key, `${(body.length / 1e6).toFixed(2)} MB`);
  }
}

const command = process.argv[2];
const commands = { pull, pages, generate, build, publish };
if (!commands[command]) {
  console.error(`Usage: node scripts/ncsf-answer-review.mjs <${Object.keys(commands).join("|")}>`);
  process.exit(2);
}
await commands[command]();
