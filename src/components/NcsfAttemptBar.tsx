import type { ReactNode } from "react";

type NcsfAnswerOutcome = "correct" | "wrong" | "unanswered";
export type NcsfReviewFilter = "all" | Exclude<NcsfAnswerOutcome, "correct">;

export function ncsfAnswerOutcome(
  selected: number | undefined,
  answer: number,
): NcsfAnswerOutcome {
  if (selected === undefined) return "unanswered";
  return selected === answer ? "correct" : "wrong";
}

export function countNcsfAnswerOutcomes(outcomes: NcsfAnswerOutcome[]) {
  const counts = { correct: 0, wrong: 0, unanswered: 0 };
  for (const outcome of outcomes) counts[outcome]++;
  return counts;
}

export function NcsfAttemptBar({
  children,
  review,
}: {
  children: ReactNode;
  review?: {
    filter: NcsfReviewFilter;
    wrong: number;
    unanswered: number;
    onChange: (filter: NcsfReviewFilter) => void;
  };
}) {
  return (
    <div className="sticky top-0 z-10 space-y-2 border-b border-rule bg-sheet p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {children}
      </div>
      {review && (review.wrong > 0 || review.unanswered > 0) && (
        <div
          role="group"
          aria-label="Lọc câu hỏi đã chấm"
          className="grid grid-flow-col auto-cols-fr gap-1 border-t border-rule pt-2 sm:flex sm:flex-wrap"
        >
          <button
            type="button"
            className="tab-button min-w-0 px-1 py-1 text-center leading-tight sm:px-2"
            aria-pressed={review.filter === "all"}
            onClick={() => review.onChange("all")}
          >
            Tất cả
          </button>
          {review.wrong > 0 && (
            <button
              type="button"
              className="tab-button min-w-0 px-1 py-1 text-center leading-tight sm:px-2"
              aria-pressed={review.filter === "wrong"}
              onClick={() => review.onChange("wrong")}
            >
              Xem {review.wrong} câu sai
            </button>
          )}
          {review.unanswered > 0 && (
            <button
              type="button"
              className="tab-button min-w-0 px-1 py-1 text-center leading-tight sm:px-2"
              aria-pressed={review.filter === "unanswered"}
              onClick={() => review.onChange("unanswered")}
            >
            Bỏ trống ({review.unanswered})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
