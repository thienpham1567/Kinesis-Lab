"use client";

import { useEffect, useState } from "react";
import { NCSF_CPT, NCSF_LESSONS, lessonOf } from "@/lib/ncsf-cpt";
import { parseNcsfQuiz, shuffleNcsfQuestionIndices, QUESTION_KINDS, type NcsfQuestion as Question, type NcsfChapter as Chapter, type QuestionKind } from "@/lib/ncsf-quiz";
import { NcsfQuestionFigure } from "./NcsfQuestionFigure";
import { NcsfSourceLinks } from "./NcsfCorrections";

const LETTERS = ["A", "B", "C", "D"];

// Shuffle option order per attempt so recall depends on content, not on remembering A/B/C/D.
const shuffled = (qs: Question[]) =>
  qs.map((q) => {
    const o = q.options.map((_, i) => i);
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  });

export function NcsfQuiz({ onOpenPage }: { onOpenPage: (slug: string, page: number) => void }) {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [error, setError] = useState(false);
  const [ch, setCh] = useState(1);
  const [lesson, setLesson] = useState(-1); // -1 = cả chương
  const [kind, setKind] = useState<QuestionKind | "all">("all");
  const [only, setOnly] = useState<number[] | null>(null); // retry-wrong subset
  const [orders, setOrders] = useState<number[][]>([]);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ncsf/quiz", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((value: unknown) => {
        if (controller.signal.aborted) return;
        const d = parseNcsfQuiz(value);
        if (!d) throw new Error("Invalid question bank");
        const firstChapter = d.chapters.find(c => c.ch === 1);
        if (!firstChapter) throw new Error("Missing chapter one");
        setChapters(d.chapters);
        setOrders(shuffled(firstChapter.questions));
        setQuestionOrder(shuffleNcsfQuestionIndices(firstChapter.questions.length));
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);

  if (error) return <p className="alert-error">Không tải được đề. Thử tải lại trang hoặc đăng nhập lại.</p>;
  if (!chapters) return <p className="text-sm text-slate">Đang tải đề…</p>;

  const chapter = chapters.find((c) => c.ch === ch);
  if (!chapter) return <p className="alert-error">Không tìm thấy chương đã chọn. Hãy tải lại đề.</p>;
  const source = NCSF_CPT[ch - 1];
  const lessons = NCSF_LESSONS[ch - 1];
  const items = questionOrder
    .map(idx => ({ q: chapter.questions[idx], idx, lesson: lessonOf(ch, chapter.questions[idx].page) }))
    .filter((it) => (lesson < 0 || it.lesson === lesson) && (kind === "all" || it.q.kind === kind) && (!only || only.includes(it.idx)));
  const wrong = items.filter((it) => picked[it.idx] !== it.q.answer).map((it) => it.idx);

  const start = (nextCh: number, nextLesson: number, subset: number[] | null, nextKind: QuestionKind | "all" = kind) => {
    const nextChapter = chapters.find(c => c.ch === nextCh);
    if (!nextChapter) {
      setError(true);
      return;
    }
    setCh(nextCh);
    setLesson(nextLesson);
    setKind(nextKind);
    setOnly(subset);
    setOrders(shuffled(nextChapter.questions));
    setQuestionOrder(shuffleNcsfQuestionIndices(nextChapter.questions.length));
    setPicked({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn chương">
        {chapters.map((c) => (
          <button key={c.ch} onClick={() => start(c.ch, -1, null, "all")} aria-pressed={c.ch === ch} className={c.ch === ch ? "button-primary" : "button-secondary"}>
            Chương {c.ch}
          </button>
        ))}
      </div>
      <label className="block max-w-xl">
        <span className="field-label">{source.title}</span>
        <select value={lesson} onChange={(e) => start(ch, Number(e.target.value), null)} className="min-h-11 w-full px-3 text-sm">
          <option value={-1}>Cả chương ({chapter.questions.length} câu)</option>
          {lessons.map((l, i) => (
            <option key={i} value={i}>
              Bài {i + 1} · {l.title} ({chapter.questions.filter((q) => lessonOf(ch, q.page) === i).length} câu)
            </option>
          ))}
        </select>
      </label>
      <label className="block max-w-xl">
        <span className="field-label">Dạng câu hỏi</span>
        <select value={kind} onChange={e => start(ch, lesson, null, e.target.value as QuestionKind | "all")} className="min-h-11 w-full px-3 text-sm">
          <option value="all">Tất cả các dạng</option>
          {Object.entries(QUESTION_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {only && <p className="text-sm font-semibold text-caution">Đang làm lại {only.length} câu sai.</p>}
      {items.length === 0 && <p className="text-sm text-slate" role="status">Bài này chưa có câu thuộc dạng đã chọn. Chọn “Tất cả các dạng” hoặc đổi bài.</p>}

      <ol className="space-y-4">
        {items.map(({ q, idx }, n) => {
          const order = orders[idx] ?? [0, 1, 2, 3];
          return (
            <li key={`${ch}-${idx}`}>
              <fieldset className="min-w-0 rounded-lg border border-rule p-4">
                <legend className="px-1 text-sm font-semibold text-ink">
                  Câu {n + 1}. {q.q}
                </legend>
                {q.kind && <p className="text-xs font-medium text-slate">{QUESTION_KINDS[q.kind]}</p>}
                {q.figure && <NcsfQuestionFigure key={`${ch}-${idx}-${q.figure.page}`} chapter={ch} page={q.figure.page} alt={q.figure.alt} />}
                <div className="mt-2 space-y-1.5">
                  {order.map((j, pos) => {
                    const state = !submitted ? "" : j === q.answer ? "border-cleared bg-cleared-soft" : picked[idx] === j ? "border-crimson bg-crimson-soft" : "";
                    return (
                      <label key={j} className={`flex cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-sm ${state || "border-transparent hover:bg-surface"}`}>
                        <input type="radio" name={`q${ch}-${idx}`} className="mt-1" checked={picked[idx] === j} disabled={submitted} onChange={() => setPicked((p) => ({ ...p, [idx]: j }))} />
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
                      {picked[idx] === q.answer ? "✓ Đúng" : picked[idx] === undefined ? "Chưa trả lời" : "✗ Sai"} — Đáp án {LETTERS[order.indexOf(q.answer)]}
                    </p>
                    <p className="text-ink">{q.explain}</p>
                    {q.correction && <div className="rounded-md border border-rule bg-sheet p-3 text-ink"><p className="font-semibold">Đính chính giáo trình</p><p>{q.correction}</p></div>}
                    <p className="text-slate">
                      {q.basis === "supplement" ? "Dẫn chứng từ nguồn bổ sung" : q.source === "image" ? "Hình trong giáo trình" : "Giáo trình"}: “{q.evidence.replace(/​/g, "")}”{" "}
                      <button className="font-semibold text-cobalt underline" onClick={() => onOpenPage(source.slug, q.page)}>
                        {q.basis === "supplement" ? "Phần liên quan trong giáo trình" : `Xem trang ${q.page}`}
                      </button>
                    </p>
                    {q.references && <NcsfSourceLinks references={q.references} />}
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
              Kết quả: {items.length - wrong.length}/{items.length} câu đúng
            </p>
            {wrong.length > 0 && (
              <button className="button-primary" onClick={() => start(ch, lesson, wrong)}>
                Làm lại {wrong.length} câu sai
              </button>
            )}
            <button className="button-secondary" onClick={() => start(ch, lesson, null)}>
              Làm lại tất cả
            </button>
          </>
        ) : (
          <button className="button-primary" disabled={items.length === 0} onClick={() => setSubmitted(true)}>
            Nộp bài ({items.filter((it) => picked[it.idx] !== undefined).length}/{items.length})
          </button>
        )}
      </div>
    </div>
  );
}
