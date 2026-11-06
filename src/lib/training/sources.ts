import { EXERCISE_EVIDENCE } from "@/lib/clinical/evidence-muscle";
import {
  identifier,
  object,
  ProgramError,
  type ProgramSourceContext,
} from "@/lib/training/program";
export function programSourceContext(ids: string[]): ProgramSourceContext {
  const exerciseIds = [...new Set(ids)].sort();
  if (
    exerciseIds.length > 84 ||
    exerciseIds.some((id) => !EXERCISE_EVIDENCE[id])
  )
    throw new ProgramError(
      "Nguồn bài tập không có trong danh mục đã cung cấp.",
    );
  return {
    kind: "curated-model-context",
    exerciseIds,
    records: Object.fromEntries(
      exerciseIds.map((id) => [id, structuredClone(EXERCISE_EVIDENCE[id])]),
    ),
    reviewedBy: null,
    notice:
      "Nguồn được cung cấp cho model; không xác minh từng nhận định AI hoặc xác nhận phù hợp cho cá nhân.",
  };
}
/** Never trust client-submitted URLs, review identities, dates or claims. */
export function validateSourceContext(
  value: unknown,
): ProgramSourceContext | null {
  if (value == null) return null;
  const c = object(value);
  if (!Array.isArray(c.exerciseIds))
    throw new ProgramError("Thiếu danh sách nguồn ngữ cảnh.");
  const expected = programSourceContext(c.exerciseIds.map(identifier));
  if (JSON.stringify(c) !== JSON.stringify(expected))
    throw new ProgramError(
      "Ngữ cảnh nguồn không khớp danh mục; không thể ghi nhận nguồn hoặc người duyệt tự tạo.",
    );
  return expected;
}
