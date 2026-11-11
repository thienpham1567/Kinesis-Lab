"use client";

import { useEffect, useState } from "react";
import { NCSF_CPT, NCSF_LESSONS, lessonOf } from "@/lib/ncsf-cpt";
import {
  NCSF_TEXTBOOK_SLUGS,
  parseAnswerReviewFile,
  type NcsfAnswerReview,
  type NcsfAnswerReviewFile,
  type NcsfReviewBank,
} from "@/lib/ncsf-answer-review";

export type AnswerReviewStatus = "idle" | "loading" | "ready" | "missing" | "error";

// Published review files are immutable per session; keep parsed copies across remounts.
const loaded = new Map<string, NcsfAnswerReviewFile | null>();

export function useNcsfAnswerReviews(
  bank: NcsfReviewBank,
  parts: number[],
  enabled: boolean,
) {
  const partsKey = [...new Set(parts)].sort((a, b) => a - b).join(",");
  const [, setVersion] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const keys = partsKey ? partsKey.split(",").map((part) => `${bank}:${part}`) : [];

  useEffect(() => {
    if (!enabled || !partsKey) return;
    const controller = new AbortController();
    const pending = partsKey
      .split(",")
      .map(Number)
      .filter((part) => !loaded.has(`${bank}:${part}`));
    if (!pending.length) return;
    Promise.all(
      pending.map(async (part) => {
        const response = await fetch(`/api/ncsf/review?bank=${bank}&part=${part}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        // 404: no review published for this part yet; the short explanation still shows.
        if (response.status === 404) return [part, null] as const;
        if (!response.ok) throw new Error(String(response.status));
        const file = parseAnswerReviewFile(await response.json(), { bank, part });
        if (!file) throw new Error("Invalid review file");
        return [part, file] as const;
      }),
    )
      .then((entries) => {
        for (const [part, file] of entries) loaded.set(`${bank}:${part}`, file);
        if (!controller.signal.aborted) {
          setFailed(null);
          setVersion((v) => v + 1);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(`${bank}:${partsKey}:${attempt}`);
      });
    return () => controller.abort();
  }, [bank, partsKey, enabled, attempt]);

  const files = keys.map((key) => loaded.get(key));
  const reviews = new Map<string, NcsfAnswerReview>();
  let model = "";
  let generatedAt = "";
  for (const file of files) {
    if (!file) continue;
    model = file.model;
    if (file.generatedAt > generatedAt) generatedAt = file.generatedAt;
    for (const [itemId, review] of Object.entries(file.items)) reviews.set(itemId, review);
  }
  const status: AnswerReviewStatus = !enabled || !keys.length
    ? "idle"
    : files.every((file) => file !== undefined)
      ? files.some((file) => file) ? "ready" : "missing"
      : failed === `${bank}:${partsKey}:${attempt}`
        ? "error"
        : "loading";
  return {
    reviews,
    status,
    model,
    generatedAt,
    retry: () => setAttempt((a) => a + 1),
  };
}

export type ReviewOption = { label: string; text: string; optionId: string };

function textbookLabel(review: NcsfAnswerReview) {
  const chapterIndex = NCSF_TEXTBOOK_SLUGS.indexOf(review.slug);
  const chapter = NCSF_CPT.find((c) => c.slug === review.slug)?.title ?? review.slug;
  const lessonIndex = chapterIndex >= 0 ? lessonOf(chapterIndex + 1, review.page) : -1;
  const lesson = lessonIndex >= 0 ? NCSF_LESSONS[chapterIndex][lessonIndex]?.title : undefined;
  return { chapter, lesson: lesson ? `Bài ${lessonIndex + 1}: ${lesson}` : null };
}

const formatDate = (iso: string) => iso.split("-").reverse().join("/");

function ReviewBody({
  review,
  correct,
  picked,
  others,
  onOpenPage,
  model,
  generatedAt,
}: {
  review: NcsfAnswerReview;
  correct: ReviewOption;
  picked?: ReviewOption;
  others: ReviewOption[];
  onOpenPage?: (slug: string, page: number) => void;
  model: string;
  generatedAt: string;
}) {
  const { chapter, lesson } = textbookLabel(review);
  const pickedReason = picked ? review.whyWrong[picked.optionId] : undefined;
  const otherReasons = others.filter((o) => review.whyWrong[o.optionId]);
  return (
    <div className="space-y-3 text-sm leading-6">
      <div>
        <p className="font-semibold text-ink">Vì sao đáp án {correct.label} đúng</p>
        <p className="text-ink">{review.whyCorrect}</p>
      </div>
      {picked && pickedReason && (
        <div>
          <p className="font-semibold text-ink">
            Vì sao lựa chọn {picked.label} của bạn chưa đúng
          </p>
          <p className="text-slate">“{picked.text}”</p>
          <p className="text-ink">{pickedReason}</p>
        </div>
      )}
      <div>
        <p className="font-semibold text-ink">Điều cần nhớ</p>
        <p className="text-ink">{review.concept}</p>
      </div>
      <figure className="min-w-0 rounded-md border border-rule bg-sheet p-3">
        <figcaption className="text-xs leading-5 text-slate">
          <span className="font-semibold text-ink">Giáo trình NCSF</span> · {chapter}
          {lesson && <> · {lesson}</>}
          {review.section && <> · Mục “{review.section}”</>} · Trang {review.page}
        </figcaption>
        {review.indirect && (
          <p className="mt-2 text-xs leading-5 text-caution">
            Đoạn này chỉ liên quan gián tiếp hoặc có thể khác với đáp án. Phần lý do ở trên có
            dùng kiến thức nền ngoài trang này; hãy đối chiếu thêm giáo trình và nguồn đối chiếu.
          </p>
        )}
        <blockquote className="mt-2 space-y-1 break-words text-ink">
          {review.passage.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </blockquote>
        {onOpenPage && (
          <button
            type="button"
            className="mt-2 min-h-10 font-semibold text-cobalt underline underline-offset-4"
            onClick={() => onOpenPage(review.slug, review.page)}
          >
            Mở trang {review.page} trong giáo trình
          </button>
        )}
      </figure>
      {otherReasons.length > 0 && (
        <details>
          <summary className="cursor-pointer font-semibold text-cobalt">
            {picked ? "Các phương án sai còn lại" : "Vì sao các phương án khác chưa đúng"} ({otherReasons.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {otherReasons.map((option) => (
              <li key={option.optionId} className="break-words">
                <span className="font-semibold text-ink">
                  {option.label}. {option.text}
                </span>
                <span className="block text-ink">{review.whyWrong[option.optionId]}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="text-xs leading-5 text-slate">
        Phần lý do do AI ({model}) soạn ngày {formatDate(generatedAt)}, chỉ dựa trên trang giáo
        trình trích ở trên; chưa có chuyên gia duyệt. Nếu lý do khác đoạn trích, hãy đối chiếu đoạn
        trích, phần đính chính (nếu có) và nguồn đối chiếu.
      </p>
    </div>
  );
}

// Expanded feedback under a graded question: open for a wrong answer, collapsed otherwise.
export function NcsfAnswerReviewPanel({
  review,
  status,
  onRetry,
  outcome,
  correct,
  picked,
  others,
  onOpenPage,
  model,
  generatedAt,
}: {
  review: NcsfAnswerReview | undefined;
  status: AnswerReviewStatus;
  onRetry: () => void;
  outcome: "wrong" | "correct" | "unanswered";
  correct: ReviewOption;
  picked?: ReviewOption;
  others: ReviewOption[];
  onOpenPage?: (slug: string, page: number) => void;
  model: string;
  generatedAt: string;
}) {
  if (status === "idle" || status === "missing") return null;
  if (status === "loading")
    return (
      <p className="text-sm text-slate" role="status">
        Đang tải giải thích đầy đủ…
      </p>
    );
  if (status === "error")
    return (
      <p className="text-sm text-slate" role="alert">
        Chưa tải được giải thích đầy đủ.{" "}
        <button
          type="button"
          className="min-h-10 font-semibold text-cobalt underline underline-offset-4"
          onClick={onRetry}
        >
          Tải lại giải thích
        </button>
      </p>
    );
  if (!review) return null;
  const body = (
    <ReviewBody
      review={review}
      correct={correct}
      picked={outcome === "wrong" ? picked : undefined}
      others={others}
      onOpenPage={onOpenPage}
      model={model}
      generatedAt={generatedAt}
    />
  );
  if (outcome === "wrong")
    return (
      <section aria-label="Giải thích đầy đủ cho câu sai" className="border-t border-rule pt-3">
        {body}
      </section>
    );
  return (
    <details className="border-t border-rule pt-3 text-sm">
      <summary className="cursor-pointer font-semibold text-cobalt">
        Xem giải thích đầy đủ và đoạn giáo trình
      </summary>
      <div className="mt-3">{body}</div>
    </details>
  );
}
