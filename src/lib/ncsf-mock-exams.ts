export type NcsfMockImage = {
  index: number;
  alt: string;
  width: number;
  height: number;
};
export type NcsfMockQuestion = {
  position: number;
  title: string;
  options: string[];
  images: NcsfMockImage[];
};
export type NcsfMockExam = { id: number; questions: NcsfMockQuestion[] };
export type NcsfMockBank = {
  version: 1;
  checkedAt: string;
  exams: NcsfMockExam[];
};
export const NCSF_MOCK_SOURCES = [
  "https://docs.google.com/forms/d/e/1FAIpQLSf7GOqPr1vU5n1mqDOuaBs8Gv1idV0TfrVsDL9lt_ip-7vw4Q/viewform",
  "https://docs.google.com/forms/d/e/1FAIpQLSeaBWG6UwfhvqH8aNO4I_xVqxc7guqNqmcxagVAeBKJdRgkQQ/viewform",
] as const;
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const keys = (v: Record<string, unknown>, allowed: string[]) =>
  Object.keys(v).length === allowed.length &&
  Object.keys(v).every((k) => allowed.includes(k));
const text = (v: unknown, max = 20000): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const integer = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

// Strict projection: no account data, draft choices or inferred answer keys enter the bank.
export function parseNcsfMockExams(value: unknown): NcsfMockBank | null {
  if (
    !object(value) ||
    !keys(value, ["version", "checkedAt", "exams"]) ||
    value.version !== 1 ||
    typeof value.checkedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt)
  )
    return null;
  const date = new Date(`${value.checkedAt}T00:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value.checkedAt ||
    !Array.isArray(value.exams) ||
    value.exams.length !== 2
  )
    return null;
  for (const [i, exam] of value.exams.entries()) {
    if (
      !object(exam) ||
      !keys(exam, ["id", "questions"]) ||
      exam.id !== i + 1 ||
      !Array.isArray(exam.questions) ||
      exam.questions.length !== 150
    )
      return null;
    for (const [j, q] of exam.questions.entries()) {
      if (
        !object(q) ||
        !keys(q, ["position", "title", "options", "images"]) ||
        q.position !== j + 1 ||
        !text(q.title) ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        q.options.length > 8 ||
        !q.options.every((o) => text(o, 10000)) ||
        !Array.isArray(q.images) ||
        q.images.length > 4
      )
        return null;
      for (const [k, image] of q.images.entries()) {
        if (
          !object(image) ||
          !keys(image, ["index", "alt", "width", "height"]) ||
          image.index !== k + 1 ||
          typeof image.alt !== "string" ||
          image.alt.length > 2000 ||
          !integer(image.width, 1, 20000) ||
          !integer(image.height, 1, 20000)
        )
          return null;
      }
    }
  }
  return value as NcsfMockBank;
}

export function mockImageKey(exam: unknown, question: unknown, image: unknown) {
  const bounded = (v: unknown, max: number) =>
    (typeof v === "number" || typeof v === "string") &&
    /^[1-9]\d*$/.test(String(v)) &&
    Number(v) <= max;
  return bounded(exam, 2) && bounded(question, 150) && bounded(image, 4)
    ? `mock-exams/e${exam}-q${question}-i${image}.png`
    : null;
}
export function mockAnsweredCount(
  exam: NcsfMockExam,
  answers: Record<number, number>,
) {
  return exam.questions.filter((q, i) =>
    integer(answers[i], 0, q.options.length - 1),
  ).length;
}

type Dependencies = {
  isAuthed: () => Promise<boolean>;
  download: (key: string) => Promise<{ data: Blob | null; error: unknown }>;
};
export async function serveNcsfMockAsset(
  kind: "bank" | "image",
  request: Request,
  deps: Dependencies,
) {
  const headers = {
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
  };
  const error = (status: number, message: string) =>
    new Response(message, { status, headers });
  if (!(await deps.isAuthed())) return error(401, "Unauthorized");
  const params = new URL(request.url).searchParams;
  const key =
    kind === "bank"
      ? "mock-exams.json"
      : mockImageKey(
          params.get("exam"),
          params.get("question"),
          params.get("image"),
        );
  if (!key) return error(404, "Not found");
  try {
    const { data, error: storageError } = await deps.download(key);
    if (storageError || !data) return error(404, "Not found");
    if (kind === "bank") {
      const bank = parseNcsfMockExams(JSON.parse(await data.text()));
      return bank
        ? Response.json(bank, { headers })
        : error(503, "Question bank unavailable");
    }
    const bytes = new Uint8Array(await data.arrayBuffer());
    if (
      bytes.length < 8 ||
      ![137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
    )
      return error(503, "Image unavailable");
    return new Response(bytes, {
      headers: { ...headers, "Content-Type": "image/png" },
    });
  } catch {
    return error(503, "Content unavailable");
  }
}
