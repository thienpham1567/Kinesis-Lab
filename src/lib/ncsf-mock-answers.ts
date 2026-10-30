import type { NcsfMockBank, NcsfMockQuestion } from "./ncsf-mock-exams";

export type MockAnswerSource = {
  title: string;
  url: string;
  locator: string;
  checkedAt: string;
  scope: string;
};
export type MockAnswer = {
  position: number;
  sourceTitle: string;
  sourceOptions: string[];
  answer: number;
  explanation: string;
  notes: string;
  qualified: boolean;
  sources: MockAnswerSource[];
  correction?: { title: string; options: string[]; reason: string };
};
export type MockAnswerKey = {
  version: 1;
  checkedAt: string;
  official: false;
  exams: { id: number; answers: MockAnswer[] }[];
};
export type MockPracticeQuestion = NcsfMockQuestion & {
  answer: number;
  explanation: string;
  notes: string;
  qualified: boolean;
  sources: MockAnswerSource[];
  original?: { title: string; options: string[]; reason: string };
};
export type MockPracticeExam = { id: number; questions: MockPracticeQuestion[] };
export type MockPracticeBank = {
  checkedAt: string;
  exams: MockPracticeExam[];
};

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: string[]) =>
  Object.keys(value).length === expected.length &&
  Object.keys(value).every((key) => expected.includes(key));
const text = (value: unknown, max = 40000): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const date = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const options = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length >= 2 && value.length <= 8 &&
  value.every((option) => text(option, 10000));
const integer = (value: unknown, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value < max;
const safeUrl = (value: unknown): value is string => {
  if (!text(value, 5000)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !!url.hostname && !url.username && !url.password;
  } catch { return false; }
};

// Only the authored key schema is admitted; account data and draft answers are rejected.
export function parseMockAnswerKey(value: unknown): MockAnswerKey | null {
  if (!object(value) || !keys(value, ["version", "checkedAt", "official", "exams"]) ||
      value.version !== 1 || value.official !== false || !date(value.checkedAt) ||
      !Array.isArray(value.exams) || value.exams.length !== 2) return null;
  for (const [examIndex, exam] of value.exams.entries()) {
    if (!object(exam) || !keys(exam, ["id", "answers"]) || exam.id !== examIndex + 1 ||
        !Array.isArray(exam.answers) || exam.answers.length !== 150) return null;
    for (const [questionIndex, answer] of exam.answers.entries()) {
      if (!object(answer) || !keys(answer, [
        "position", "sourceTitle", "sourceOptions", "answer", "explanation", "notes",
        "qualified", "sources", ...(answer.correction === undefined ? [] : ["correction"]),
      ]) || answer.position !== questionIndex + 1 || !text(answer.sourceTitle, 20000) ||
          !options(answer.sourceOptions) || !text(answer.explanation) ||
          typeof answer.notes !== "string" || answer.notes.length > 40000 ||
          typeof answer.qualified !== "boolean" || !Array.isArray(answer.sources) ||
          answer.sources.length < 1 || answer.sources.length > 30) return null;
      let gradingOptions = answer.sourceOptions;
      if (answer.correction !== undefined) {
        const correction = answer.correction;
        if (!object(correction) || !keys(correction, ["title", "options", "reason"]) ||
            !text(correction.title, 20000) || !options(correction.options) ||
            !text(correction.reason)) return null;
        gradingOptions = correction.options;
      }
      if (!integer(answer.answer, gradingOptions.length)) return null;
      for (const source of answer.sources) {
        if (!object(source) || !keys(source, ["title", "url", "locator", "checkedAt", "scope"]) ||
            !text(source.title, 5000) || !safeUrl(source.url) || !text(source.locator, 10000) ||
            !date(source.checkedAt) || !text(source.scope, 20000)) return null;
      }
    }
  }
  return value as MockAnswerKey;
}

// Exact original text guards prevent a stale key from scoring a different question or choice.
export function prepareMockPractice(bank: NcsfMockBank, value: unknown): MockPracticeBank | null {
  const key = parseMockAnswerKey(value);
  if (!key || bank.exams.length !== 2) return null;
  for (const [examIndex, exam] of bank.exams.entries()) {
    const answers = key.exams[examIndex];
    if (exam.id !== answers.id || exam.questions.length !== answers.answers.length) return null;
    for (const [questionIndex, question] of exam.questions.entries()) {
      const answer = answers.answers[questionIndex];
      if (question.position !== answer.position || question.title !== answer.sourceTitle ||
          question.options.length !== answer.sourceOptions.length ||
          question.options.some((option, i) => option !== answer.sourceOptions[i])) return null;
    }
  }
  return {
    checkedAt: key.checkedAt,
    exams: bank.exams.map((exam, examIndex) => ({
      id: exam.id,
      questions: exam.questions.map((question, questionIndex) => {
        const entry = key.exams[examIndex].answers[questionIndex];
        return {
          ...question,
          title: entry.correction?.title ?? question.title,
          options: [...(entry.correction?.options ?? question.options)],
          images: question.images.map((image) => ({ ...image })),
          answer: entry.answer,
          explanation: entry.explanation,
          notes: entry.notes,
          qualified: entry.qualified,
          sources: entry.sources.map((source) => ({ ...source })),
          ...(entry.correction ? { original: {
            title: question.title,
            options: [...question.options],
            reason: entry.correction.reason,
          } } : {}),
        };
      }),
    })),
  };
}

export function gradeMockExam(exam: MockPracticeExam, picks: Record<number, number>) {
  let correct = 0, wrong = 0, unanswered = 0;
  exam.questions.forEach((question, sourceIndex) => {
    const picked = picks[sourceIndex];
    if (!integer(picked, question.options.length)) unanswered++;
    else if (picked === question.answer) correct++;
    else wrong++;
  });
  return { correct, wrong, unanswered, total: exam.questions.length, answered: correct + wrong };
}

// The explanation may mention original choice letters. Translate only option-reference
// contexts; scientific letters and vitamin names must remain part of the authored text.
export function mockFeedbackText(text: string, optionOrder: number[]) {
  const label = (original: string) => {
    const index = optionOrder.indexOf(original.toUpperCase().charCodeAt(0) - 65);
    return index < 0 ? original : String.fromCharCode(65 + index);
  };
  const protectedRanges = [...text.matchAll(/(?:vitamin|loại|type|nhóm máu)\s+[A-H](?:\s*(?:[,/]|và|hoặc)\s*[A-H])*/giu)]
    .map((match) => [match.index, match.index + match[0].length]);
  const translate = (original: string) => original
    .replace(/([A-H])[-–]([A-H])/giu, (_, first: string, last: string) => {
      const start = first.toUpperCase().charCodeAt(0), end = last.toUpperCase().charCodeAt(0);
      const direction = end >= start ? 1 : -1;
      return Array.from({ length: Math.abs(end - start) + 1 }, (_, i) =>
        String.fromCharCode(start + i * direction)).join(", ");
    })
    .replace(/[A-H]/giu, label);
  const references = /((?:đáp án|lựa chọn|phương án)\s*)([A-H](?:[\/–-][A-H])*)(?![\p{L}\d])|(?<![\p{L}\d-])([A-H])(?=\s+(?:là|khớp|phù hợp|mô tả|phản ánh|đúng|thể hiện|nêu|chỉ là|vượt|rút gọn|có thể|cũng|trực tiếp|vẫn|viết)(?=\s|[.,;:!?]|$))|((?:phù hợp với|theo cách|như|tránh|không xem)\s+)([A-H])(?![\p{L}\d])/giu;
  return text.replace(references, (match, prefix: string | undefined, listed: string | undefined,
    predicate: string | undefined, context: string | undefined, contextual: string | undefined, offset: number) => {
    if (protectedRanges.some(([start, end]) => offset >= start && offset < end)) return match;
    const original = listed ?? predicate ?? contextual;
    if (!original) return match;
    const before = prefix !== undefined ? `${prefix.trimEnd()} ` : context ?? "";
    return `${before}${translate(original)}`;
  });
}

type AnswerDependencies = {
  isAuthed: () => Promise<boolean>;
  download: (key: string) => Promise<{ data: Blob | null; error: unknown }>;
};
export async function serveMockAnswers(deps: AnswerDependencies) {
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" };
  const error = (status: number, message: string) => new Response(message, { status, headers });
  try {
    if (!(await deps.isAuthed())) return error(401, "Unauthorized");
    const { data, error: storageError } = await deps.download("mock-answers.json");
    if (storageError || !data) return error(404, "Not found");
    const key = parseMockAnswerKey(JSON.parse(await data.text()));
    return key ? Response.json(key, { headers }) : error(503, "Answer key unavailable");
  } catch { return error(503, "Content unavailable"); }
}
