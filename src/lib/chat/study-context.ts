import type { StudyContext } from "./study-types";

let current: StudyContext | null = null;
const listeners = new Set<() => void>();
export const getStudyContext = () => current;
export const getServerStudyContext = () => null;
export function subscribeStudyContext(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function publishStudyContext(context: StudyContext | null) {
  current = context;
  listeners.forEach((listener) => listener());
}
export function studyContextLabel(context: StudyContext) {
  return `${context.name}${context.side === "left" ? " · Trái" : context.side === "right" ? " · Phải" : ""}`;
}
/** Questions request evidence; they do not assert unsupported anatomy. */
export function studyQuestions(context: StudyContext | null) {
  const subject = context
    ? `${context.name} (${context.english})`
    : "chủ đề vận động tôi đang hỏi";
  return [
    {
      label: context ? "Giải phẫu & chức năng" : "Khám phá giải phẫu",
      prompt: `Tổng hợp giải phẫu và chức năng của ${subject} từ nhiều nguồn uy tín. Gắn nguồn cho từng ý và nói rõ phần chưa đủ tài liệu.`,
    },
    {
      label: "Đối chiếu bằng chứng",
      prompt: `Các nguồn uy tín thống nhất và khác nhau ở điểm nào về ${subject}? Phân biệt thông tin được nguồn hỗ trợ với suy luận.`,
    },
    {
      label: "Liên hệ bài tập",
      prompt: `Tổng hợp bằng chứng từ nguồn uy tín về bài tập liên quan đến ${subject}. Nêu giới hạn áp dụng; không suy chức năng từ mesh 3D.`,
    },
  ];
}
