// Expanded answer feedback for the NCSF study-guide bank and mock exams.
// Each review is keyed by the learning itemId (question identity) and each wrong-option
// reason by the option-text hash, so shuffling or editing a question never shows a stale reason.
// Passages are verbatim textbook lines; reasons are AI drafts grounded on that page, never
// expert-reviewed (`reviewedBy` stays null until a real review happens).

export const NCSF_TEXTBOOK_SLUGS = [
  "01-suc-khoe-the-duc",
  "02-giai-phau-chuc-nang",
  "03-he-nang-luong",
  "04-sang-loc-danh-gia",
  "05-dinh-duong",
  "06-quan-ly-can-nang",
  "07-len-chuong-trinh",
  "08-doi-tuong-dac-biet",
] as const;
// Same values as NCSF_PAGE_COUNTS in ncsf-quiz.ts; kept local so Node checks load this file
// without a bundler. scripts/check-ncsf-answer-review.mjs asserts they stay equal.
export const NCSF_TEXTBOOK_PAGE_COUNTS = [48, 77, 48, 70, 67, 37, 153, 32] as const;

export type NcsfReviewBank = "quiz" | "mock";

export type NcsfAnswerReview = {
  slug: (typeof NCSF_TEXTBOOK_SLUGS)[number];
  page: number;
  section: string;
  passage: string[];
  concept: string;
  whyCorrect: string;
  whyWrong: Record<string, string>;
  // Set when the generator found the quoted page only indirectly supports (or may conflict
  // with) the answer key; the UI then says so instead of presenting the quote as proof.
  indirect?: true;
};

export type NcsfAnswerReviewFile = {
  version: 1;
  bank: NcsfReviewBank;
  part: number;
  generatedAt: string;
  method: "ai-draft-from-textbook-page";
  model: string;
  reviewedBy: null;
  items: Record<string, NcsfAnswerReview>;
};

export const REVIEW_LIMITS = {
  section: 300,
  passageLines: 6,
  passageLine: 1200,
  concept: 700,
  whyCorrect: 1600,
  whyWrong: 1200,
  options: 8,
} as const;

const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const exactKeys = (v: Record<string, unknown>, keys: string[]) =>
  Object.keys(v).length === keys.length && Object.keys(v).every((k) => keys.includes(k));
const hash = (v: string) => /^[0-9a-f]{64}$/.test(v);

export function reviewPartValid(bank: unknown, part: unknown): part is number {
  if (typeof part !== "number" || !Number.isInteger(part)) return false;
  if (bank === "quiz") return part >= 1 && part <= 8;
  if (bank === "mock") return part === 1 || part === 2;
  return false;
}

// The only storage locations review requests may address. Never accept a caller's path.
export function answerReviewKey(bank: unknown, part: unknown): string | null {
  const n = typeof part === "string" && /^[1-8]$/.test(part) ? Number(part) : part;
  if (!reviewPartValid(bank, n)) return null;
  return bank === "quiz" ? `review/quiz-ch${n}.json` : `review/mock-${n}.json`;
}

export function answerReviewErrors(value: unknown): string[] {
  if (!record(value)) return ["Review must be an object"];
  const errors: string[] = [];
  if (!exactKeys(value, [
    "slug", "page", "section", "passage", "concept", "whyCorrect", "whyWrong",
    ...(value.indirect === undefined ? [] : ["indirect"]),
  ])) errors.push("Unexpected review keys");
  if (value.indirect !== undefined && value.indirect !== true) errors.push("Invalid indirect flag");
  const slugIndex = NCSF_TEXTBOOK_SLUGS.indexOf(value.slug as (typeof NCSF_TEXTBOOK_SLUGS)[number]);
  if (slugIndex < 0) errors.push("Unknown textbook chapter");
  if (
    typeof value.page !== "number" || !Number.isInteger(value.page) || value.page < 1 ||
    (slugIndex >= 0 && value.page > NCSF_TEXTBOOK_PAGE_COUNTS[slugIndex])
  ) errors.push("Invalid textbook page");
  if (typeof value.section !== "string" || value.section.length > REVIEW_LIMITS.section)
    errors.push("Invalid section");
  if (
    !Array.isArray(value.passage) || value.passage.length < 1 ||
    value.passage.length > REVIEW_LIMITS.passageLines ||
    !value.passage.every((line) => text(line, REVIEW_LIMITS.passageLine))
  ) errors.push("Invalid textbook passage");
  if (!text(value.concept, REVIEW_LIMITS.concept)) errors.push("Invalid concept");
  if (!text(value.whyCorrect, REVIEW_LIMITS.whyCorrect)) errors.push("Invalid correct-answer reason");
  if (!record(value.whyWrong)) errors.push("Invalid wrong-option reasons");
  else {
    const entries = Object.entries(value.whyWrong);
    if (entries.length < 1 || entries.length >= REVIEW_LIMITS.options) errors.push("Invalid wrong-option count");
    if (!entries.every(([id, reason]) => hash(id) && text(reason, REVIEW_LIMITS.whyWrong)))
      errors.push("Invalid wrong-option reason");
  }
  return errors;
}

export function parseAnswerReviewFile(
  value: unknown,
  expected?: { bank: NcsfReviewBank; part: number },
): NcsfAnswerReviewFile | null {
  if (
    !record(value) ||
    !exactKeys(value, ["version", "bank", "part", "generatedAt", "method", "model", "reviewedBy", "items"]) ||
    value.version !== 1 ||
    !reviewPartValid(value.bank, value.part) ||
    (expected && (value.bank !== expected.bank || value.part !== expected.part)) ||
    typeof value.generatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.generatedAt) ||
    value.method !== "ai-draft-from-textbook-page" ||
    !text(value.model, 200) ||
    value.reviewedBy !== null ||
    !record(value.items)
  ) return null;
  for (const [itemId, review] of Object.entries(value.items))
    if (!hash(itemId) || answerReviewErrors(review).length) return null;
  return value as NcsfAnswerReviewFile;
}

export async function serveAnswerReview(request: Request, dependencies: {
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
    const bank = query.get("bank");
    const key = answerReviewKey(bank, query.get("part"));
    if (!key) return new Response("Not found", { status: 404, headers });
    const { data, error } = await dependencies.download(key);
    if (error || !data) return new Response("Not found", { status: 404, headers });
    const file = parseAnswerReviewFile(JSON.parse(await data.text()), {
      bank: bank as NcsfReviewBank,
      part: Number(query.get("part")),
    });
    return file
      ? Response.json(file, { headers })
      : new Response("Review unavailable", { status: 503, headers });
  } catch {
    return new Response("Không tải được giải thích. Thử lại sau.", { status: 503, headers });
  }
}
