"use client";

import { useEffect, useRef, useState } from "react";
import { NCSF_CPT, NCSF_LESSONS, lessonOf } from "@/lib/ncsf-cpt";
import {
  parseNcsfQuiz,
  shuffleNcsfQuestionIndices,
  type NcsfQuestion as Question,
  type NcsfChapter as Chapter,
} from "@/lib/ncsf-quiz";
import {
  identifyQuizBank,
  type IdentifiedQuizBank,
} from "@/lib/learning/ncsf-identity";
import {
  buildStudySessionItems,
  domainLabel,
  SHORT_SESSION_MAX_ITEMS,
} from "@/lib/learning/schedule";
import type {
  LearningDraft,
  LearningDraftItem,
  LearningItemResult,
} from "@/lib/learning/types";
import type { UseLearningProgressResult } from "./learning/useLearningProgress";
import { NcsfQuestionFigure } from "./NcsfQuestionFigure";
import { NcsfSourceLinks } from "./NcsfCorrections";

const LETTERS = ["A", "B", "C", "D"];
export const QUIZ_DRAFT_ID = "ncsf-quiz-active";

const questionLessonIndex = (chNum: number, q: Question) =>
  typeof q.lesson === "number" && q.lesson >= 1
    ? q.lesson - 1
    : lessonOf(chNum, q.page);

export type NcsfQuizSessionRequest =
  | { id: number; kind: "resume-draft"; draft: LearningDraft }
  | { id: number; kind: "due-review" }
  | { id: number; kind: "domain-study"; domain: string };

type CustomQuizItem = {
  pickKey: string;
  ch: number;
  idx: number;
  q: Question;
  itemId: string;
  optionIds: string[];
  order: number[];
};

type CustomQuizSession = {
  title: string;
  removedCount: number;
  items: CustomQuizItem[];
};

let attemptCounter = 0;
function nextQuizAttemptId(): string {
  attemptCounter += 1;
  const rand = Math.floor(Math.random() * 1000000).toString(36);
  return `ncsf-quiz-${Date.now().toString(36)}-${attemptCounter}-${rand}`;
}

function shuffleOptionIndices(length: number): number[] {
  const o = Array.from({ length }, (_, i) => i);
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

// Shuffle option order per attempt so recall depends on content, not on remembering A/B/C/D.
const shuffled = (qs: Question[]) =>
  qs.map((q) => shuffleOptionIndices(q.options.length));

function computeDraftState(
  draft: LearningDraft,
  loadedChapters: Chapter[],
  bankIndex: IdentifiedQuizBank,
): {
  customSession: CustomQuizSession;
  picked: Record<string, number>;
  attemptId: string;
} {
  const restoredItems: CustomQuizItem[] = [];
  const nextPicked: Record<string, number> = {};
  let removedCount = 0;
  const chapterByNum = new Map(loadedChapters.map((c) => [c.ch, c]));

  for (const draftItem of draft.items) {
    const record = bankIndex.byItemId.get(draftItem.itemId);
    const loc = record?.locations.find((l) => l.source === "ncsf-quiz");
    const chap = loc ? chapterByNum.get(loc.ch) : undefined;
    const q = loc && chap ? chap.questions[loc.questionIndex] : undefined;
    if (!record || !loc || !q) {
      removedCount += 1;
      continue;
    }
    const order = draftItem.optionOrder.map((optHash) =>
      record.optionIds.indexOf(optHash),
    );
    if (
      order.length !== q.options.length ||
      order.some((idx) => idx < 0) ||
      new Set(order).size !== q.options.length
    ) {
      removedCount += 1;
      continue;
    }
    const pickKey = `${loc.ch}-${loc.questionIndex}`;
    if (draftItem.selectedOptionId !== null) {
      const selectedIdx = record.optionIds.indexOf(draftItem.selectedOptionId);
      if (selectedIdx >= 0) {
        nextPicked[pickKey] = selectedIdx;
      }
    }
    restoredItems.push({
      pickKey,
      ch: loc.ch,
      idx: loc.questionIndex,
      q,
      itemId: record.itemId,
      optionIds: record.optionIds,
      order,
    });
  }

  return {
    customSession: {
      title: "Phiên đang tiếp tục trên trình duyệt này",
      removedCount,
      items: restoredItems,
    },
    picked: nextPicked,
    attemptId: nextQuizAttemptId(),
  };
}

function computeSessionRequestState(
  req: NcsfQuizSessionRequest,
  loadedChapters: Chapter[],
  bankIndex: IdentifiedQuizBank,
  currentProgress?: UseLearningProgressResult,
): {
  customSession: CustomQuizSession;
  picked: Record<string, number>;
  attemptId: string;
} {
  if (req.kind === "resume-draft") {
    return computeDraftState(req.draft, loadedChapters, bankIndex);
  }

  const summary = currentProgress?.summary ?? {
    nowIso: new Date().toISOString(),
    totalSubmissions: 0,
    totalSeenItems: 0,
    dueItems: [],
    itemsById: {},
    domains: [],
  };

  const selectedIds = buildStudySessionItems({
    catalogItems: bankIndex.allItems,
    summary,
    domainFilter: req.kind === "domain-study" ? req.domain : null,
    mode: req.kind === "domain-study" ? "domain" : "due-first",
    maxItems: SHORT_SESSION_MAX_ITEMS,
  });

  const sessionItems: CustomQuizItem[] = [];
  const chapterByNum = new Map(loadedChapters.map((c) => [c.ch, c]));
  for (const itemId of selectedIds) {
    const record = bankIndex.byItemId.get(itemId);
    const loc = record?.locations.find((l) => l.source === "ncsf-quiz");
    const chap = loc ? chapterByNum.get(loc.ch) : undefined;
    const q = loc && chap ? chap.questions[loc.questionIndex] : undefined;
    if (!record || !loc || !q) continue;
    sessionItems.push({
      pickKey: `${loc.ch}-${loc.questionIndex}`,
      ch: loc.ch,
      idx: loc.questionIndex,
      q,
      itemId: record.itemId,
      optionIds: record.optionIds,
      order: shuffleOptionIndices(q.options.length),
    });
  }

  const title =
    req.kind === "due-review"
      ? `Phiên ôn câu đến hạn (${sessionItems.length} câu · tối đa ${SHORT_SESSION_MAX_ITEMS} câu)`
      : `Học theo chủ đề: ${domainLabel(req.domain)} (${sessionItems.length} câu · tối đa ${SHORT_SESSION_MAX_ITEMS} câu)`;

  return {
    customSession: {
      title,
      removedCount: 0,
      items: sessionItems,
    },
    picked: {},
    attemptId: nextQuizAttemptId(),
  };
}

export function NcsfQuiz({
  onOpenPage,
  onSessionExpired,
  progress,
  sessionRequest,
  onBackToProgress,
}: {
  onOpenPage: (slug: string, page: number) => void;
  onSessionExpired?: () => void;
  progress?: UseLearningProgressResult;
  sessionRequest?: NcsfQuizSessionRequest | null;
  onBackToProgress?: () => void;
}) {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [identifiedBank, setIdentifiedBank] =
    useState<IdentifiedQuizBank | null>(null);
  const [error, setError] = useState<"load" | "session" | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [ch, setCh] = useState(1);
  const [lesson, setLesson] = useState(-1); // -1 = cả chương
  const [only, setOnly] = useState<number[] | null>(null); // retry-wrong subset
  const [orders, setOrders] = useState<number[][]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [customSession, setCustomSession] = useState<CustomQuizSession | null>(
    null,
  );

  const attemptIdRef = useRef<string>(nextQuizAttemptId());
  const submittedIdsRef = useRef<Set<string>>(new Set());
  const appliedRequestIdRef = useRef<number | null>(null);
  const autoRestoredDraftRef = useRef(false);
  const userTouchedRef = useRef(false);
  const sessionRequestRef = useRef<NcsfQuizSessionRequest | null | undefined>(
    sessionRequest,
  );
  const progressRef = useRef<UseLearningProgressResult | undefined>(progress);

  useEffect(() => {
    sessionRequestRef.current = sessionRequest;
    progressRef.current = progress;
  }, [sessionRequest, progress]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ncsf/quiz", { signal: controller.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(r.status === 401 ? "session" : "load"),
      )
      .then((value: unknown) => {
        if (controller.signal.aborted) return;
        const d = parseNcsfQuiz(value);
        if (!d) throw new Error("Invalid question bank");
        const firstChapter = d.chapters.find((c) => c.ch === 1);
        if (!firstChapter) throw new Error("Missing chapter one");
        const bankIndex = identifyQuizBank(d);
        setChapters(d.chapters);
        setIdentifiedBank(bankIndex);
        setOrders(shuffled(firstChapter.questions));
        setQuestionOrder(
          shuffleNcsfQuestionIndices(firstChapter.questions.length),
        );
        const pendingReq = sessionRequestRef.current;
        const currentProgress = progressRef.current;
        if (pendingReq && appliedRequestIdRef.current !== pendingReq.id) {
          appliedRequestIdRef.current = pendingReq.id;
          userTouchedRef.current = true;
          const next = computeSessionRequestState(
            pendingReq,
            d.chapters,
            bankIndex,
            currentProgress,
          );
          setCustomSession(next.customSession);
          setPicked(next.picked);
          setSubmitted(false);
          attemptIdRef.current = next.attemptId;
        } else if (
          currentProgress?.hydrated &&
          !autoRestoredDraftRef.current &&
          !userTouchedRef.current
        ) {
          autoRestoredDraftRef.current = true;
          const savedQuizDraft = currentProgress.drafts.find(
            (dr) => dr.source === "ncsf-quiz" && dr.id === QUIZ_DRAFT_ID,
          );
          if (savedQuizDraft) {
            const next = computeDraftState(
              savedQuizDraft,
              d.chapters,
              bankIndex,
            );
            setCustomSession(next.customSession);
            setPicked(next.picked);
            setSubmitted(false);
            attemptIdRef.current = next.attemptId;
          }
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason === "session" ? "session" : "load");
      });
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    if (!chapters || !identifiedBank || !sessionRequest) return;
    if (appliedRequestIdRef.current === sessionRequest.id) return;
    appliedRequestIdRef.current = sessionRequest.id;
    userTouchedRef.current = true;
    const next = computeSessionRequestState(
      sessionRequest,
      chapters,
      identifiedBank,
      progress,
    );
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setCustomSession(next.customSession);
      setPicked(next.picked);
      setSubmitted(false);
      attemptIdRef.current = next.attemptId;
    });
    return () => {
      cancelled = true;
    };
  }, [chapters, identifiedBank, sessionRequest, progress]);

  useEffect(() => {
    if (
      !chapters ||
      !identifiedBank ||
      !progress?.hydrated ||
      autoRestoredDraftRef.current ||
      userTouchedRef.current ||
      sessionRequest
    ) {
      return;
    }
    autoRestoredDraftRef.current = true;
    const savedQuizDraft = progress.drafts.find(
      (d) => d.source === "ncsf-quiz" && d.id === QUIZ_DRAFT_ID,
    );
    if (!savedQuizDraft) return;
    const next = computeDraftState(savedQuizDraft, chapters, identifiedBank);
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setCustomSession(next.customSession);
      setPicked(next.picked);
      setSubmitted(false);
      attemptIdRef.current = next.attemptId;
    });
    return () => {
      cancelled = true;
    };
  }, [chapters, identifiedBank, progress, sessionRequest]);

  if (error)
    return (
      <div className="space-y-3">
        <p className="alert-error" role="alert">
          {error === "session"
            ? "Phiên truy cập đã hết hạn. Đăng nhập lại để tải đề."
            : "Không tải được đề. Kiểm tra kết nối rồi thử lại."}
        </p>
        {error === "session" && onSessionExpired ? (
          <button
            type="button"
            className="button-secondary"
            onClick={onSessionExpired}
          >
            Đăng nhập lại
          </button>
        ) : (
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setError(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Tải lại đề
          </button>
        )}
      </div>
    );
  if (!chapters)
    return (
      <p className="text-sm text-slate" role="status">
        Đang tải đề…
      </p>
    );

  const chapter = chapters.find((c) => c.ch === ch);
  if (!chapter)
    return (
      <p className="alert-error">
        Không tìm thấy chương đã chọn. Hãy tải lại đề.
      </p>
    );
  const source = NCSF_CPT[ch - 1];
  const lessons = NCSF_LESSONS[ch - 1];

  const chapterIdentified = identifiedBank?.byChapter.get(ch) ?? [];
  const activeItems: CustomQuizItem[] = customSession
    ? customSession.items
    : questionOrder
        .map((idx) => {
          const q = chapter.questions[idx];
          const idInfo = chapterIdentified[idx];
          return {
            pickKey: `${ch}-${idx}`,
            ch,
            idx,
            q,
            lesson: questionLessonIndex(ch, q),
            itemId: idInfo?.itemId ?? `ch${ch}-q${idx}`,
            optionIds:
              idInfo?.optionIds ??
              q.options.map((_, optIdx) => `opt-${optIdx}`),
            order: orders[idx] ?? [0, 1, 2, 3],
          };
        })
        .filter(
          (it) =>
            (lesson < 0 || it.lesson === lesson) &&
            (!only || only.includes(it.idx)),
        );

  const wrongItems = activeItems.filter(
    (it) => picked[it.pickKey] !== it.q.answer,
  );
  const wrongIndices = wrongItems.map((it) => it.idx);

  const start = (
    nextCh: number,
    nextLesson: number,
    subset: number[] | null,
  ) => {
    const nextChapter = chapters.find((c) => c.ch === nextCh);
    if (!nextChapter) {
      setError("load");
      return;
    }
    userTouchedRef.current = true;
    setCustomSession(null);
    setCh(nextCh);
    setLesson(nextLesson);
    setOnly(subset);
    setOrders(shuffled(nextChapter.questions));
    setQuestionOrder(
      shuffleNcsfQuestionIndices(nextChapter.questions.length),
    );
    setPicked({});
    setSubmitted(false);
    attemptIdRef.current = nextQuizAttemptId();
  };

  const restartCustomSession = (onlyWrong: boolean) => {
    if (!customSession) return;
    const base = onlyWrong ? wrongItems : customSession.items;
    const shuffledIndices = shuffleNcsfQuestionIndices(base.length);
    const nextItems = shuffledIndices.map((i) => {
      const item = base[i]!;
      return {
        ...item,
        order: shuffleOptionIndices(item.q.options.length),
      };
    });
    setCustomSession({
      ...customSession,
      removedCount: 0,
      items: nextItems,
    });
    setPicked({});
    setSubmitted(false);
    attemptIdRef.current = nextQuizAttemptId();
  };

  const handleSelectOption = (item: CustomQuizItem, optionIndex: number) => {
    userTouchedRef.current = true;
    const nextPicked = { ...picked, [item.pickKey]: optionIndex };
    setPicked(nextPicked);

    if (progress && identifiedBank && activeItems.length > 0) {
      const draftItems: LearningDraftItem[] = activeItems.map((it) => {
        const chosenIdx = nextPicked[it.pickKey];
        return {
          itemId: it.itemId,
          optionOrder: it.order.map((optIdx) => it.optionIds[optIdx]!),
          selectedOptionId:
            chosenIdx !== undefined ? (it.optionIds[chosenIdx] ?? null) : null,
        };
      });
      progress.queueSaveDraft({
        id: QUIZ_DRAFT_ID,
        source: "ncsf-quiz",
        revision: 0,
        updatedAt: new Date().toISOString(),
        items: draftItems,
        currentItemId: item.itemId,
      });
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const currentAttemptId = attemptIdRef.current;
    if (
      progress &&
      identifiedBank &&
      activeItems.length > 0 &&
      !submittedIdsRef.current.has(currentAttemptId)
    ) {
      submittedIdsRef.current.add(currentAttemptId);
      const submissionItems: LearningItemResult[] = activeItems.map((it) => {
        const chosenIdx = picked[it.pickKey];
        return {
          itemId: it.itemId,
          selectedOptionId:
            chosenIdx !== undefined ? (it.optionIds[chosenIdx] ?? null) : null,
          correct: chosenIdx === it.q.answer,
          domain: it.q.domain ?? null,
        };
      });
      void progress.submitAttempt(
        {
          id: currentAttemptId,
          source: "ncsf-quiz",
          submittedAt: new Date().toISOString(),
          items: submissionItems,
        },
        QUIZ_DRAFT_ID,
      );
    }
  };

  return (
    <div className="space-y-5">
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

      {customSession && (
        <div className="space-y-2 rounded-lg border border-rule bg-surface p-3.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-ink">{customSession.title}</p>
            <div className="flex flex-wrap gap-2">
              {onBackToProgress && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={onBackToProgress}
                >
                  Quay lại tiến độ học
                </button>
              )}
              <button
                type="button"
                className="button-secondary"
                onClick={() => start(ch, -1, null)}
              >
                Quay về chọn chương
              </button>
            </div>
          </div>
          {customSession.removedCount > 0 && (
            <p className="text-caution" role="status">
              Đã loại {customSession.removedCount} câu không còn khả dụng khỏi
              phiên tiếp tục do nội dung câu hỏi hoặc đáp án đã thay đổi.
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-rule bg-surface p-3.5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-ink">
            Đề cương ôn tập theo bài (8 chương · 40 đề ôn tập)
          </p>
          <a
            href={
              lesson >= 0
                ? `https://ncsfvietnam.com.vn/cpt-chuong-${ch}-bai-${lesson + 1}/`
                : `https://ncsfvietnam.com.vn/cpt-chuong-${ch}-bai-1/`
            }
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-cobalt underline"
          >
            {lesson >= 0
              ? `Nguồn đề gốc Chương ${ch} · Bài ${lesson + 1}`
              : `Nguồn đề gốc Chương ${ch}`}
          </a>
        </div>
        <p className="mt-1 text-slate">
          Toàn bộ câu hỏi được tổng hợp từ 40 liên kết Đề ôn tập trong Đề cương
          ôn tập NCSF CPT. Đáp án, giải thích và trang tham chiếu được nghiên cứu,
          đối chiếu với giáo trình NCSF và y văn uy tín (không phải khóa đáp án
          chính thức của NCSF).
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn chương">
        {chapters.map((c) => (
          <button
            key={c.ch}
            onClick={() => start(c.ch, -1, null)}
            aria-pressed={!customSession && c.ch === ch}
            className={
              !customSession && c.ch === ch
                ? "button-primary"
                : "button-secondary"
            }
          >
            Chương {c.ch}
          </button>
        ))}
      </div>
      <label className="block max-w-xl">
        <span className="field-label">{source.title}</span>
        <select
          value={lesson}
          onChange={(e) => start(ch, Number(e.target.value), null)}
          className="min-h-11 w-full px-3 text-sm"
        >
          <option value={-1}>Cả chương ({chapter.questions.length} câu)</option>
          {lessons.map((l, i) => (
            <option key={i} value={i}>
              Bài {i + 1} · {l.title} (
              {
                chapter.questions.filter(
                  (q) => questionLessonIndex(ch, q) === i,
                ).length
              }{" "}
              câu)
            </option>
          ))}
        </select>
      </label>
      {only && !customSession && (
        <p className="text-sm font-semibold text-caution">
          Đang làm lại {only.length} câu sai.
        </p>
      )}
      {activeItems.length === 0 && (
        <p className="text-sm text-slate" role="status">
          Bài này chưa có câu hỏi. Hãy chọn bài khác.
        </p>
      )}

      <ol className="space-y-4">
        {activeItems.map((item, n) => {
          const { q, idx, order, pickKey } = item;
          const itemCh = item.ch;
          const itemSource = NCSF_CPT[itemCh - 1] ?? source;
          return (
            <li key={pickKey}>
              <fieldset className="min-w-0 rounded-lg border border-rule p-4">
                <legend className="px-1 text-sm font-semibold text-ink">
                  Câu {n + 1}. {q.q}
                </legend>
                {q.figure && (
                  <NcsfQuestionFigure
                    key={`${itemCh}-${idx}-${q.figure.page}`}
                    chapter={itemCh}
                    page={q.figure.page}
                    alt={q.figure.alt}
                  />
                )}
                <div className="mt-2 space-y-1.5">
                  {order.map((j, pos) => {
                    const state = !submitted
                      ? ""
                      : j === q.answer
                        ? "border-cleared bg-cleared-soft"
                        : picked[pickKey] === j
                          ? "border-crimson bg-crimson-soft"
                          : "";
                    return (
                      <label
                        key={j}
                        className={`flex cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-sm ${state || "border-transparent hover:bg-surface"}`}
                      >
                        <input
                          type="radio"
                          name={`q${itemCh}-${idx}`}
                          className="mt-1"
                          checked={picked[pickKey] === j}
                          disabled={submitted}
                          onChange={() => handleSelectOption(item, j)}
                        />
                        <span>
                          {LETTERS[pos]}. {q.options[j]}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="mt-3 space-y-1.5 rounded-md bg-surface p-3 text-sm">
                    <p className="font-semibold text-ink">
                      {picked[pickKey] === q.answer
                        ? "✓ Đúng"
                        : picked[pickKey] === undefined
                          ? "Chưa trả lời"
                          : "✗ Sai"}{" "}
                      — Đáp án {LETTERS[order.indexOf(q.answer)]}
                    </p>
                    <p className="text-ink">{q.explain}</p>
                    {q.correction && (
                      <div className="rounded-md border border-rule bg-sheet p-3 text-ink">
                        <p className="font-semibold">Đính chính giáo trình</p>
                        <p>{q.correction}</p>
                      </div>
                    )}
                    <p className="text-slate">
                      {q.basis === "supplement"
                        ? "Dẫn chứng từ nguồn bổ sung"
                        : q.source === "image"
                          ? "Hình trong giáo trình"
                          : "Giáo trình"}
                      : “{q.evidence.replace(/​/g, "")}”{" "}
                      <button
                        className="font-semibold text-cobalt underline"
                        onClick={() => onOpenPage(itemSource.slug, q.page)}
                      >
                        {q.basis === "supplement"
                          ? "Phần liên quan trong giáo trình"
                          : `Xem trang ${q.page}`}
                      </button>
                    </p>
                    {q.references && (
                      <NcsfSourceLinks references={q.references} />
                    )}
                  </div>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        {submitted ? (
          <>
            <p className="text-base font-semibold text-ink" role="status">
              Kết quả: {activeItems.length - wrongItems.length}/
              {activeItems.length} câu đúng
            </p>
            {wrongItems.length > 0 && (
              <button
                className="button-primary"
                onClick={() =>
                  customSession
                    ? restartCustomSession(true)
                    : start(ch, lesson, wrongIndices)
                }
              >
                Làm lại {wrongItems.length} câu sai
              </button>
            )}
            <button
              className="button-secondary"
              onClick={() =>
                customSession
                  ? restartCustomSession(false)
                  : start(ch, lesson, null)
              }
            >
              Làm lại tất cả
            </button>
          </>
        ) : (
          <button
            className="button-primary"
            disabled={activeItems.length === 0}
            onClick={handleSubmit}
          >
            Nộp bài (
            {
              activeItems.filter((it) => picked[it.pickKey] !== undefined)
                .length
            }
            /{activeItems.length})
          </button>
        )}
      </div>
    </div>
  );
}
