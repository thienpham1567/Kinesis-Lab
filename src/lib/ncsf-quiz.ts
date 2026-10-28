export const NCSF_PAGE_COUNTS = [48, 77, 48, 70, 67, 37, 153, 32] as const;

export const QUESTION_KINDS = {
  recall: "Nhận biết",
  mechanism: "Cơ chế / so sánh",
  numeric: "Thông số",
  calculation: "Tính toán",
  scenario: "Tình huống",
  figure: "Hình / bảng",
} as const;

export const NCSF_DOMAINS = {
  "functional-anatomy": "Giải phẫu chức năng",
  "exercise-physiology": "Sinh lý tập luyện",
  "health-fitness": "Sức khỏe và thể lực",
  "screening-evaluation": "Sàng lọc và đánh giá",
  nutrition: "Dinh dưỡng",
  "weight-management": "Quản lý cân nặng",
  "exercise-programming": "Thiết kế chương trình",
  "training-instruction": "Hướng dẫn kỹ thuật",
  "special-populations": "Nhóm đối tượng đặc biệt",
  "professionalism-risk": "Chuyên nghiệp và quản lý rủi ro",
} as const;

export type QuestionKind = keyof typeof QUESTION_KINDS;
export type NcsfDomain = keyof typeof NCSF_DOMAINS;
export type NcsfReference = {
  title: string;
  url: string;
  checkedAt: string;
  scope: "full-text" | "abstract" | "excerpt";
};
export type NcsfQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  page: number;
  evidence: string;
  source?: "image";
  obj?: string[];
  kind?: QuestionKind;
  domain?: NcsfDomain;
  references?: NcsfReference[];
  correction?: string;
  correctionBasis?: "textbook";
  basis?: "supplement";
  figure?: { page: number; alt: string };
};
export type NcsfChapter = { ch: number; questions: NcsfQuestion[] };
export type NcsfQuizData = { chapters: NcsfChapter[] };

// Shuffle stable indices so answer keys, page links and retry subsets keep their identity.
export function shuffleNcsfQuestionIndices(length: number, random = Math.random): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const norm = (v: string) => v.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
const integer = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isSafeInteger(v) ? v : null;
  return typeof v === "string" && /^[1-9]\d{0,2}$/.test(v) ? Number(v) : null;
};

// The only storage location figure requests may address. Never accept a caller's path/URL.
export function figureObjectKey(chapter: unknown, page: unknown): string | null {
  const ch = integer(chapter);
  const p = integer(page);
  if (ch === null || p === null || ch < 1 || ch > 8 || p < 1 || p > NCSF_PAGE_COUNTS[ch - 1]) return null;
  return `figures/ch${ch}-p${p}.png`;
}

function referenceValid(value: unknown): boolean {
  if (!record(value) || !nonempty(value.title) || !nonempty(value.url) || typeof value.checkedAt !== "string") return false;
  if (!["full-text", "abstract", "excerpt"].includes(String(value.scope))) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt)) return false;
  const date = new Date(`${value.checkedAt}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.checkedAt) return false;
  try {
    const url = new URL(value.url);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

// Checks data integrity, not the medical truth or completeness of a learning objective.
export function questionErrors(value: unknown, chapter: number): string[] {
  if (!record(value)) return ["Question must be an object"];
  const errors: string[] = [];
  for (const key of ["q", "explain", "evidence"])
    if (!nonempty(value[key])) errors.push(`Missing ${key}`);
  const options = value.options;
  if (!Array.isArray(options) || options.length !== 4 || !options.every(nonempty) || new Set(options.filter(nonempty).map(norm)).size !== 4)
    errors.push("Need four distinct, nonempty options");
  if (!Number.isInteger(value.answer) || Number(value.answer) < 0 || Number(value.answer) > 3) errors.push("Invalid answer index");
  if (typeof value.page !== "number" || !figureObjectKey(chapter, value.page)) errors.push("Invalid source page");
  if (value.source !== undefined && value.source !== "image") errors.push("Invalid source type");
  if (value.obj !== undefined && (!Array.isArray(value.obj) || !value.obj.every(v => typeof v === "string" && /^O[1-8]\.\d{3}$/.test(v)))) errors.push("Invalid objective IDs");
  if (value.kind !== undefined && !Object.hasOwn(QUESTION_KINDS, String(value.kind))) errors.push("Invalid question kind");
  if (value.domain !== undefined && !Object.hasOwn(NCSF_DOMAINS, String(value.domain))) errors.push("Invalid domain");
  if (value.basis !== undefined && value.basis !== "supplement") errors.push("Invalid evidence basis");
  if (value.correction !== undefined && !nonempty(value.correction)) errors.push("Empty correction");
  if (value.correctionBasis !== undefined && (value.correctionBasis !== "textbook" || !nonempty(value.correction))) errors.push("Invalid correction basis");
  const references = value.references;
  if (references !== undefined && (!Array.isArray(references) || !references.length || !references.every(referenceValid))) errors.push("Invalid source references");
  if ((value.basis === "supplement" || (value.correction !== undefined && value.correctionBasis !== "textbook")) && (!Array.isArray(references) || !references.length)) errors.push("Supplement/correction needs references");
  if (value.figure !== undefined && (!record(value.figure) || !nonempty(value.figure.alt) || typeof value.figure.page !== "number" || !figureObjectKey(chapter, value.figure.page))) errors.push("Invalid figure");
  return errors;
}

export function parseNcsfQuiz(value: unknown): NcsfQuizData | null {
  if (!record(value) || !Array.isArray(value.chapters) || value.chapters.length !== 8) return null;
  const seen = new Set<number>();
  for (const chapter of value.chapters) {
    if (!record(chapter) || typeof chapter.ch !== "number" || !Number.isInteger(chapter.ch) || chapter.ch < 1 || chapter.ch > 8 || seen.has(chapter.ch)) return null;
    if (!Array.isArray(chapter.questions) || !chapter.questions.length || chapter.questions.some(q => questionErrors(q, chapter.ch as number).length)) return null;
    seen.add(chapter.ch);
  }
  return value as NcsfQuizData;
}

export function pageCorrections(bank: NcsfQuizData, chapter: number, page: number) {
  const notes = new Map<string, { text: string; references: NcsfReference[] }>();
  for (const q of bank.chapters.find(c => c.ch === chapter)?.questions ?? []) {
    if (!q.correction || (q.page !== page && q.figure?.page !== page)) continue;
    const note = notes.get(q.correction) ?? { text: q.correction, references: [] };
    for (const ref of q.references ?? [])
      if (!note.references.some(r => r.url === ref.url && r.scope === ref.scope && r.checkedAt === ref.checkedAt)) note.references.push(ref);
    notes.set(q.correction, note);
  }
  return [...notes.values()];
}

export async function serveNcsfFigure(request: Request, dependencies: {
  isAuthed: () => Promise<boolean>;
  download: (key: string) => Promise<{ data: Blob | null; error: unknown }>;
}): Promise<Response> {
  const headers = {
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
  };
  try {
    if (!(await dependencies.isAuthed())) return new Response("Unauthorized", { status: 401, headers });
    const query = new URL(request.url).searchParams;
    const key = figureObjectKey(query.get("chapter"), query.get("page"));
    if (!key) return new Response("Not found", { status: 404, headers });
    const { data, error } = await dependencies.download(key);
    if (error || !data) return new Response("Not found", { status: 404, headers });
    return new Response(data, { headers: { ...headers, "Content-Type": "image/png" } });
  } catch {
    return new Response("Không tải được hình. Thử lại sau.", { status: 503, headers });
  }
}
