"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  mockAnsweredCount,
  mockQuestionText,
  mockOptionText,
  shuffleMockExam,
  type NcsfMockOrder,
  NCSF_MOCK_SOURCES,
  parseNcsfMockExams,
  type NcsfMockImage,
} from "@/lib/ncsf-mock-exams";
import {
  gradeMockExam,
  mockFeedbackText,
  prepareMockPractice,
  type MockPracticeBank,
} from "@/lib/ncsf-mock-answers";
import {
  identifyMockBank,
  type IdentifiedMockBank,
} from "@/lib/learning/ncsf-identity";
import type {
  LearningDraft,
  LearningDraftItem,
  LearningItemResult,
} from "@/lib/learning/types";
import type { UseLearningProgressResult } from "./learning/useLearningProgress";

export const MOCK_DRAFT_ID = "ncsf-mock-active";

let mockAttemptSeq = 0;
function nextMockAttemptId(examId: number): string {
  mockAttemptSeq += 1;
  const rand = Math.floor(Math.random() * 1000000).toString(36);
  return `ncsf-mock-${examId}-${Date.now().toString(36)}-${mockAttemptSeq}-${rand}`;
}

function MockImage({
  exam,
  position,
  image,
}: {
  exam: number;
  position: number;
  image: NcsfMockImage;
}) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <figure className="my-3 min-w-0 max-w-full overflow-hidden rounded-lg border border-rule bg-sheet">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-3 py-2 text-sm">
        <span>Hình gốc của câu hỏi</span>
        <button
          type="button"
          className="button-secondary min-h-10"
          aria-pressed={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Thu nhỏ hình" : "Phóng to hình"}
        </button>
      </figcaption>
      {failed ? (
        <div className="space-y-2 p-4 text-sm" role="alert">
          <p>Không tải được hình. Hãy tải lại hình trước khi trả lời.</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setFailed(false)}
          >
            Tải lại hình
          </button>
        </div>
      ) : (
        <div
          className="max-h-[40rem] min-w-0 overflow-auto p-3"
          tabIndex={0}
          aria-label="Khung hình có thể cuộn"
        >
          <Image
            unoptimized
            loading="lazy"
            src={`/api/ncsf/mock-image?exam=${exam}&question=${position}&image=${image.index}`}
            alt={image.alt || `Hình nguồn của câu ở vị trí ${position}`}
            width={image.width}
            height={image.height}
            onError={() => setFailed(true)}
            className={
              expanded
                ? "h-auto w-[60rem] max-w-none"
                : "mx-auto h-auto max-h-[32rem] w-auto max-w-full object-contain"
            }
          />
        </div>
      )}
    </figure>
  );
}

export type NcsfMockExamsHandle = {
  reshuffle: () => void;
  resumeDraft?: (draft: LearningDraft) => void;
};

export function NcsfMockExams({
  apiRef,
  progress,
  pendingDraft,
  onDraftConsumed,
  onBackToProgress,
  onSessionExpired,
}: {
  apiRef?: Ref<NcsfMockExamsHandle>;
  progress?: UseLearningProgressResult;
  pendingDraft?: LearningDraft | null;
  onDraftConsumed?: () => void;
  onBackToProgress?: () => void;
  onSessionExpired?: () => void;
}) {
  const [bank, setBank] = useState<MockPracticeBank | null>(null);
  const [identifiedBank, setIdentifiedBank] =
    useState<IdentifiedMockBank | null>(null);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [reload, setReload] = useState(0);
  const [active, setActive] = useState(1);
  const [answers, setAnswers] = useState<
    Record<number, Record<number, number>>
  >({ 1: {}, 2: {} });
  const [orders, setOrders] = useState<Record<number, NcsfMockOrder>>({});
  const [finished, setFinished] = useState<Record<number, boolean>>({});
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);

  const attemptIdsRef = useRef<Record<number, string>>({
    1: nextMockAttemptId(1),
    2: nextMockAttemptId(2),
  });
  const submittedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ["/api/ncsf/mock-exams", "/api/ncsf/mock-answers"].map(async (url) => {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          if (response.status === 401) {
            const authErr = new Error(
              "Phiên truy cập đã hết hạn. Hãy đăng nhập lại thư viện.",
            );
            authErr.name = "SessionExpiredError";
            throw authErr;
          }
          throw new Error("Không tải được đề thi và đáp án. Hãy thử lại.");
        }
        return response.json();
      }),
    )
      .then(([source, key]) => {
        const original = parseNcsfMockExams(source);
        const data = original && prepareMockPractice(original, key);
        if (!data)
          throw new Error(
            "Đề thi và đáp án chưa khớp. Hãy tải lại trước khi làm bài.",
          );
        if (!controller.signal.aborted) {
          setOrders(
            Object.fromEntries(
              data.exams.map((e) => [e.id, shuffleMockExam(e)]),
            ),
          );
          setIdentifiedBank(identifyMockBank(data));
          setBank(data);
          setSessionExpired(false);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          if (e instanceof Error && e.name === "SessionExpiredError") {
            setSessionExpired(true);
          }
          setError(
            e instanceof Error ? e.message : "Không tải được đề thi thử.",
          );
        }
      });
    return () => controller.abort();
  }, [reload]);

  const applyDraft = useCallback(
    (draft: LearningDraft) => {
      if (!bank || !identifiedBank) return;
      let targetExamId = active;
      for (const draftItem of draft.items) {
        const rec = identifiedBank.byItemId.get(draftItem.itemId);
        const loc = rec?.locations.find((l) => l.source === "ncsf-mock");
        if (loc && loc.source === "ncsf-mock") {
          targetExamId = loc.examId;
          break;
        }
      }
      const exam = bank.exams.find((e) => e.id === targetExamId);
      const examIdentified = identifiedBank.byExam.get(targetExamId);
      if (!exam || !examIdentified) return;

      const nextQuestions: number[] = [];
      const nextOptions: number[][] = exam.questions.map((q, idx) =>
        orders[targetExamId]?.options[idx] ??
        Array.from({ length: q.options.length }, (_, i) => i),
      );
      const nextExamAnswers: Record<number, number> = {};
      let removedCount = 0;

      for (const draftItem of draft.items) {
        const rec = identifiedBank.byItemId.get(draftItem.itemId);
        const loc = rec?.locations.find(
          (l) => l.source === "ncsf-mock" && l.examId === targetExamId,
        );
        if (!rec || !loc || loc.source !== "ncsf-mock") {
          removedCount += 1;
          continue;
        }
        const qIdx = loc.questionIndex;
        const q = exam.questions[qIdx];
        if (!q) {
          removedCount += 1;
          continue;
        }
        const optOrder = draftItem.optionOrder.map((optHash) =>
          rec.optionIds.indexOf(optHash),
        );
        if (
          optOrder.length !== q.options.length ||
          optOrder.some((idx) => idx < 0) ||
          new Set(optOrder).size !== q.options.length
        ) {
          removedCount += 1;
          continue;
        }
        nextQuestions.push(qIdx);
        nextOptions[qIdx] = optOrder;
        if (draftItem.selectedOptionId !== null) {
          const pickedIdx = rec.optionIds.indexOf(draftItem.selectedOptionId);
          if (pickedIdx >= 0) {
            nextExamAnswers[qIdx] = pickedIdx;
          }
        }
      }

      if (nextQuestions.length === 0) {
        setResumedNotice(
          `Không thể khôi phục phiên làm dở vì cả ${removedCount} câu đã thay đổi hoặc không còn khả dụng.`,
        );
        return;
      }

      setActive(targetExamId);
      setOrders((prev) => ({
        ...prev,
        [targetExamId]: {
          questions: nextQuestions,
          options: nextOptions,
        },
      }));
      setAnswers((prev) => ({
        ...prev,
        [targetExamId]: nextExamAnswers,
      }));
      setFinished((prev) => ({
        ...prev,
        [targetExamId]: false,
      }));
      attemptIdsRef.current[targetExamId] = nextMockAttemptId(targetExamId);
      setResumedNotice(
        removedCount > 0
          ? `Đã tiếp tục phiên Bộ đề ${targetExamId} (${nextQuestions.length} câu). Đã loại ${removedCount} câu không còn khả dụng do nội dung đã thay đổi.`
          : `Đã tiếp tục phiên Bộ đề ${targetExamId} (${nextQuestions.length} câu).`,
      );
    },
    [active, bank, identifiedBank, orders],
  );

  useEffect(() => {
    if (!bank || !identifiedBank || !pendingDraft) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      applyDraft(pendingDraft);
      onDraftConsumed?.();
    });
    return () => {
      cancelled = true;
    };
  }, [bank, identifiedBank, pendingDraft, applyDraft, onDraftConsumed]);

  const reshuffle = useCallback(
    (examId?: number) => {
      if (!bank) return;
      const updated = Object.fromEntries(
        bank.exams
          .filter((e) => examId === undefined || e.id === examId)
          .map((e) => [e.id, shuffleMockExam(e, orders[e.id])]),
      );
      setOrders({ ...orders, ...updated });
      setResumedNotice(null);
    },
    [bank, orders],
  );

  useImperativeHandle(
    apiRef,
    () => ({
      reshuffle,
      resumeDraft: applyDraft,
    }),
    [reshuffle, applyDraft],
  );

  if (error)
    return (
      <div className="space-y-3" role="alert">
        <p>{error}</p>
        {sessionExpired && onSessionExpired ? (
          <button
            type="button"
            className="button-secondary"
            onClick={onSessionExpired}
          >
            Đăng nhập lại
          </button>
        ) : (
          <button
            className="button-secondary"
            onClick={() => {
              setError("");
              setSessionExpired(false);
              setReload((v) => v + 1);
            }}
          >
            Thử lại
          </button>
        )}
      </div>
    );
  if (!bank || !orders[active])
    return (
      <p className="text-sm text-slate" role="status">
        Đang tải hai bộ đề thi thử…
      </p>
    );

  const exam = bank.exams[active - 1];
  const order = orders[active];
  const selections = answers[active];
  const count = mockAnsweredCount(exam, selections);
  const done = !!finished[active];
  const grade = gradeMockExam(exam, selections);
  const clarified = exam.questions.filter((q) => q.original).length;
  const savedMockDraft =
    progress?.drafts.find(
      (d) => d.source === "ncsf-mock" && d.id === MOCK_DRAFT_ID,
    ) ?? null;

  const handleSelectOption = (sourceIndex: number, optionIndex: number) => {
    const nextExamSelections = {
      ...answers[active],
      [sourceIndex]: optionIndex,
    };
    setAnswers((v) => ({
      ...v,
      [active]: nextExamSelections,
    }));

    const examIdentified = identifiedBank?.byExam.get(active);
    if (progress && examIdentified && order.questions.length > 0) {
      const draftItems: LearningDraftItem[] = order.questions.map((qIdx) => {
        const idInfo = examIdentified[qIdx]!;
        const optOrder = order.options[qIdx]!.map(
          (optIdx) => idInfo.optionIds[optIdx]!,
        );
        const pickedIdx = nextExamSelections[qIdx];
        return {
          itemId: idInfo.itemId,
          optionOrder: optOrder,
          selectedOptionId:
            pickedIdx !== undefined
              ? (idInfo.optionIds[pickedIdx] ?? null)
              : null,
        };
      });
      const currentItemId =
        examIdentified[sourceIndex]?.itemId ?? draftItems[0]?.itemId ?? null;
      progress.queueSaveDraft({
        id: MOCK_DRAFT_ID,
        source: "ncsf-mock",
        revision: 0,
        updatedAt: new Date().toISOString(),
        items: draftItems,
        currentItemId,
      });
    }
  };

  const handleCompleteExam = () => {
    setFinished((v) => ({ ...v, [active]: true }));
    const examIdentified = identifiedBank?.byExam.get(active);
    const currentAttemptId =
      attemptIdsRef.current[active] ?? nextMockAttemptId(active);
    if (
      progress &&
      examIdentified &&
      order.questions.length > 0 &&
      !submittedIdsRef.current.has(currentAttemptId)
    ) {
      submittedIdsRef.current.add(currentAttemptId);
      const submissionItems: LearningItemResult[] = order.questions.map(
        (qIdx) => {
          const q = exam.questions[qIdx]!;
          const idInfo = examIdentified[qIdx]!;
          const pickedIdx = selections[qIdx];
          return {
            itemId: idInfo.itemId,
            selectedOptionId:
              pickedIdx !== undefined
                ? (idInfo.optionIds[pickedIdx] ?? null)
                : null,
            correct: pickedIdx === q.answer,
            domain: idInfo.domain,
          };
        },
      );
      void progress.submitAttempt(
        {
          id: currentAttemptId,
          source: "ncsf-mock",
          submittedAt: new Date().toISOString(),
          items: submissionItems,
        },
        MOCK_DRAFT_ID,
      );
    }
  };

  return (
    <div className="min-w-0 space-y-5">
      {progress?.saveError && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-crimson/40 bg-crimson-soft p-3 text-sm text-ink"
          role="alert"
        >
          <p>{progress.saveError}</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => void progress.retryLastSave()}
          >
            Thử lưu lại
          </button>
        </div>
      )}

      {(savedMockDraft || resumedNotice || onBackToProgress) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rule bg-surface p-3 text-sm">
          <div className="space-y-1">
            {resumedNotice ? (
              <p className="text-ink" role="status">
                {resumedNotice}
              </p>
            ) : savedMockDraft ? (
              <p className="text-ink">
                Có một phiên đề thi thử đang làm dở trên trình duyệt này (đã
                chọn{" "}
                {
                  savedMockDraft.items.filter(
                    (it) => it.selectedOptionId !== null,
                  ).length
                }
                /{savedMockDraft.items.length} câu).
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {savedMockDraft && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => applyDraft(savedMockDraft)}
              >
                Tiếp tục phiên đề thi thử đang dở
              </button>
            )}
            {onBackToProgress && (
              <button
                type="button"
                className="button-secondary"
                onClick={onBackToProgress}
              >
                Quay lại tiến độ học
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2" aria-label="Chọn bộ đề thi thử">
        {bank.exams.map((e) => (
          <button
            key={e.id}
            type="button"
            className="tab-button"
            aria-pressed={active === e.id}
            onClick={() => {
              reshuffle(e.id);
              setActive(e.id);
            }}
          >
            Bộ đề {e.id} · {e.questions.length} câu
          </button>
        ))}
      </div>
      <div className="space-y-2 text-sm text-slate">
        <h2 className="text-lg font-semibold text-ink">
          Đề thi thử NCSF · Bộ {active}
        </h2>
        <p>
          Câu hỏi và lựa chọn được xáo trộn mỗi lần mở đề; đáp án đi cùng nội
          dung. Đáp án được đối chiếu nguồn ngày{" "}
          {bank.checkedAt.split("-").reverse().join("/")}.
        </p>
        <p>
          Đây là đáp án biên soạn để luyện tập, chưa phải khóa đáp án chính thức
          của NCSF. Bộ này có {clarified} câu đã làm rõ để chấm một đáp án; bạn
          có thể xem câu gốc bên dưới. Giải thích và nguồn đối chiếu xuất hiện
          sau khi hoàn thành bài.
        </p>
        <a
          className="font-semibold text-cobalt underline underline-offset-4"
          href={NCSF_MOCK_SOURCES[active - 1]}
          target="_blank"
          rel="noreferrer"
        >
          Mở đề gốc NCSF
        </a>
      </div>
      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rule bg-sheet p-3 shadow-sm">
        <p className="text-sm font-semibold text-ink" role="status">
          {done
            ? `Đúng ${grade.correct}/${order.questions.length} câu`
            : `Đã trả lời · ${count}/${order.questions.length} câu`}
        </p>
        {done ? (
          <button
            type="button"
            className="button-secondary"
            onClick={(event) => {
              // This node becomes the submit control after reset; cancel the original click first.
              event.preventDefault();
              reshuffle(active);
              setAnswers((v) => ({ ...v, [active]: {} }));
              setFinished((v) => ({ ...v, [active]: false }));
              attemptIdsRef.current[active] = nextMockAttemptId(active);
            }}
          >
            Làm lại bộ đề {active}
          </button>
        ) : (
          <button
            type="submit"
            form={`ncsf-mock-${active}`}
            className="button-primary"
          >
            Hoàn thành bài
          </button>
        )}
      </div>
      {done && (
        <p
          className="rounded-lg border border-rule bg-surface p-3 text-sm"
          role="status"
        >
          Kết quả luyện tập: {grade.correct} câu đúng, {grade.wrong} câu sai,{" "}
          {grade.unanswered} câu chưa trả lời. Điểm tính trên toàn bộ{" "}
          {grade.total} câu. Xem đáp án, giải thích và nguồn bên dưới.
        </p>
      )}
      <form
        id={`ncsf-mock-${active}`}
        onSubmit={(e) => {
          e.preventDefault();
          handleCompleteExam();
        }}
        className="space-y-5"
      >
        {order.questions.map((sourceIndex, displayIndex) => {
          const q = exam.questions[sourceIndex];
          return (
            <fieldset
              key={`${active}-${q.position}`}
              data-position={q.position}
              data-source-title={q.original?.title ?? q.title}
              data-clarified={q.original ? "true" : undefined}
              className="min-w-0 rounded-lg border border-rule px-4 pb-4 pt-2 sm:px-5"
            >
              <legend className="max-w-full whitespace-pre-wrap break-words px-1 text-sm font-semibold leading-6 text-ink">
                Câu {displayIndex + 1}: {mockQuestionText(q.title)}
              </legend>
              {q.original && (
                <details className="my-2 rounded-lg border border-rule bg-surface px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-semibold text-cobalt">
                    Câu đã làm rõ · Xem câu gốc
                  </summary>
                  <div className="mt-3 space-y-2 whitespace-pre-wrap break-words text-slate">
                    <p>{q.original.title}</p>
                    <ul className="space-y-1 pl-4">
                      {q.original.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                    {done && (
                      <p className="border-t border-rule pt-2">
                        Đối chiếu câu gốc: {q.original.reason}
                      </p>
                    )}
                  </div>
                </details>
              )}
              {q.images.map((image) => (
                <MockImage
                  key={`${active}-${q.position}-${image.index}`}
                  exam={active}
                  position={q.position}
                  image={image}
                />
              ))}
              <div className="mt-2 space-y-1">
                {order.options[sourceIndex].map(
                  (optionIndex, displayOptionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex min-h-11 items-start gap-3 rounded-lg px-2 py-3 text-sm leading-6 ${done ? "cursor-default" : "cursor-pointer"} ${done && optionIndex === q.answer ? "bg-cleared-soft text-ink" : done && selections[sourceIndex] === optionIndex ? "bg-crimson-soft text-ink" : selections[sourceIndex] === optionIndex ? "bg-cobalt-soft text-ink" : "text-ink hover:bg-surface"}`}
                    >
                      <input
                        type="radio"
                        disabled={done}
                        className="mt-1 shrink-0 accent-cobalt"
                        name={`mock-${active}-${q.position}`}
                        value={optionIndex}
                        checked={selections[sourceIndex] === optionIndex}
                        onChange={() =>
                          handleSelectOption(sourceIndex, optionIndex)
                        }
                      />
                      <span className="min-w-0 whitespace-pre-wrap break-words">
                        {String.fromCharCode(65 + displayOptionIndex)}.{" "}
                        {mockOptionText(q.options[optionIndex])}
                        {done && optionIndex === q.answer && (
                          <span className="ml-2 font-semibold text-cleared">
                            ✓ Đáp án đúng
                          </span>
                        )}
                        {done && selections[sourceIndex] === optionIndex && (
                          <span className="ml-2 font-semibold">· Bạn chọn</span>
                        )}
                      </span>
                    </label>
                  ),
                )}
              </div>
              {done && (
                <div
                  className="mt-3 space-y-3 border-t border-rule pt-3 text-sm leading-6"
                  data-feedback
                >
                  <p className="font-semibold text-ink">
                    {selections[sourceIndex] === undefined
                      ? "Chưa trả lời"
                      : selections[sourceIndex] === q.answer
                        ? "✓ Đúng"
                        : "✕ Sai"}
                    {" · Đáp án "}
                    {String.fromCharCode(
                      65 + order.options[sourceIndex].indexOf(q.answer),
                    )}
                    {": "}
                    {mockOptionText(q.options[q.answer])}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-ink">
                    {mockFeedbackText(q.explanation, order.options[sourceIndex])}
                  </p>
                  {(q.qualified || q.notes) && (
                    <div className="rounded-lg bg-surface p-3 text-slate">
                      {q.qualified && (
                        <p className="font-semibold text-ink">
                          Lưu ý phạm vi áp dụng
                        </p>
                      )}
                      {q.notes && (
                        <p className="whitespace-pre-wrap break-words">
                          {mockFeedbackText(q.notes, order.options[sourceIndex])}
                        </p>
                      )}
                    </div>
                  )}
                  <details className="text-slate">
                    <summary className="cursor-pointer font-semibold text-cobalt">
                      Nguồn đối chiếu ({q.sources.length})
                    </summary>
                    <ul className="mt-2 space-y-3 pl-4">
                      {q.sources.map((source, index) => (
                        <li key={index} className="break-words">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cobalt underline underline-offset-4"
                          >
                            {source.title}
                          </a>
                          <p>{source.locator}</p>
                          <p>
                            {source.scope} · Đọc ngày{" "}
                            {source.checkedAt.split("-").reverse().join("/")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </fieldset>
          );
        })}
        {!done && (
          <button type="submit" className="button-primary">
            Hoàn thành bài
          </button>
        )}
      </form>
    </div>
  );
}
