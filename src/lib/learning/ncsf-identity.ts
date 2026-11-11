import { lessonOf } from "@/lib/ncsf-cpt";
import type { MockPracticeBank, MockPracticeQuestion } from "@/lib/ncsf-mock-answers";
import { mockOptionText, mockQuestionText } from "@/lib/ncsf-mock-exams";
import type { NcsfQuizData, NcsfQuestion } from "@/lib/ncsf-quiz";
import type {
  IdentifiedItemRecord,
  IdentifiedMockQuestion,
  IdentifiedQuizQuestion,
} from "./types";

// FIPS 180-4 SHA-256 constants for synchronous deterministic hashing.
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const nativeEncoder =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

function encodeUtf8(input: string): Uint8Array {
  if (nativeEncoder) return nativeEncoder.encode(input);
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < input.length) {
      const c2 = input.charCodeAt(++i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Hex(input: string): string {
  const bytes = encodeUtf8(input);
  const bitLen = bytes.length * 8;
  const paddedLen = ((bytes.length + 9 + 63) >>> 6) << 6;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("");
}

export async function sha256HexAsync(input: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      encodeUtf8(input) as BufferSource,
    );
    return Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
  }
  return sha256Hex(input);
}

// Unicode NFC and whitespace normalization; preserves case and Vietnamese diacritics.
export function normalizeLearningText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u200B\uFE0F]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export function hashOptionText(optionText: string): string {
  return sha256Hex(`ncsf-option:v1:${normalizeLearningText(optionText)}`);
}

export function identifyQuizQuestion(
  ch: number,
  questionIndex: number,
  question: NcsfQuestion,
): IdentifiedQuizQuestion {
  const optionIds = question.options.map((opt) => hashOptionText(opt));
  const canonicalOptions = [...optionIds].sort();
  const correctOptionId = optionIds[question.answer] ?? "";
  const figureMeta = question.figure
    ? `${question.figure.page}:${normalizeLearningText(question.figure.alt)}`
    : "";
  const payload = JSON.stringify({
    ns: "ncsf-quiz:v1",
    ch,
    stem: normalizeLearningText(question.q),
    options: canonicalOptions,
    answer: correctOptionId,
    explain: normalizeLearningText(question.explain),
    page: question.page,
    figure: figureMeta,
  });
  const itemId = sha256Hex(payload);
  return {
    itemId,
    source: "ncsf-quiz",
    ch,
    questionIndex,
    page: question.page,
    lesson: lessonOf(ch, question.page),
    domain: question.domain ?? null,
    optionIds,
    correctOptionId,
  };
}

export function identifyMockQuestion(
  examId: number,
  questionIndex: number,
  question: MockPracticeQuestion,
): IdentifiedMockQuestion {
  const cleanedOptions = question.options.map((opt) => mockOptionText(opt));
  const optionIds = cleanedOptions.map((opt) => hashOptionText(opt));
  const canonicalOptions = [...optionIds].sort();
  const correctOptionId = optionIds[question.answer] ?? "";
  const imageMeta = question.images.map((img) => ({
    index: img.index,
    alt: normalizeLearningText(img.alt),
    width: img.width,
    height: img.height,
  }));
  const payload = JSON.stringify({
    ns: "ncsf-mock:v1",
    examId,
    stem: normalizeLearningText(mockQuestionText(question.title)),
    options: canonicalOptions,
    answer: correctOptionId,
    explain: normalizeLearningText(question.explanation),
    page: 0,
    images: imageMeta,
  });
  const itemId = sha256Hex(payload);
  return {
    itemId,
    source: "ncsf-mock",
    examId,
    questionIndex,
    position: question.position,
    domain: null,
    optionIds,
    correctOptionId,
  };
}

export type IdentifiedQuizBank = {
  byChapter: Map<number, IdentifiedQuizQuestion[]>;
  byItemId: Map<string, IdentifiedItemRecord>;
  allItems: IdentifiedItemRecord[];
};

export function identifyQuizBank(bank: NcsfQuizData): IdentifiedQuizBank {
  const byChapter = new Map<number, IdentifiedQuizQuestion[]>();
  const byItemId = new Map<string, IdentifiedItemRecord>();
  for (const chapter of bank.chapters) {
    const chapterItems: IdentifiedQuizQuestion[] = [];
    chapter.questions.forEach((question, questionIndex) => {
      const identified = identifyQuizQuestion(
        chapter.ch,
        questionIndex,
        question,
      );
      chapterItems.push(identified);
      const existing = byItemId.get(identified.itemId);
      const location = {
        source: "ncsf-quiz" as const,
        ch: chapter.ch,
        questionIndex,
        page: identified.page,
        lesson: identified.lesson,
        domain: identified.domain,
      };
      if (existing) {
        existing.locations.push(location);
        if (!existing.domain && identified.domain) {
          existing.domain = identified.domain;
        }
      } else {
        byItemId.set(identified.itemId, {
          itemId: identified.itemId,
          source: "ncsf-quiz",
          domain: identified.domain,
          optionIds: identified.optionIds,
          correctOptionId: identified.correctOptionId,
          locations: [location],
        });
      }
    });
    byChapter.set(chapter.ch, chapterItems);
  }
  return {
    byChapter,
    byItemId,
    allItems: [...byItemId.values()],
  };
}

export type IdentifiedMockBank = {
  byExam: Map<number, IdentifiedMockQuestion[]>;
  byItemId: Map<string, IdentifiedItemRecord>;
  allItems: IdentifiedItemRecord[];
};

export function identifyMockBank(bank: MockPracticeBank): IdentifiedMockBank {
  const byExam = new Map<number, IdentifiedMockQuestion[]>();
  const byItemId = new Map<string, IdentifiedItemRecord>();
  for (const exam of bank.exams) {
    const examItems: IdentifiedMockQuestion[] = [];
    exam.questions.forEach((question, questionIndex) => {
      const identified = identifyMockQuestion(exam.id, questionIndex, question);
      examItems.push(identified);
      const existing = byItemId.get(identified.itemId);
      const location = {
        source: "ncsf-mock" as const,
        examId: exam.id,
        questionIndex,
        position: identified.position,
        domain: null,
      };
      if (existing) {
        existing.locations.push(location);
      } else {
        byItemId.set(identified.itemId, {
          itemId: identified.itemId,
          source: "ncsf-mock",
          domain: null,
          optionIds: identified.optionIds,
          correctOptionId: identified.correctOptionId,
          locations: [location],
        });
      }
    });
    byExam.set(exam.id, examItems);
  }
  return {
    byExam,
    byItemId,
    allItems: [...byItemId.values()],
  };
}
