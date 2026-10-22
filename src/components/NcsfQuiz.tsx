"use client";

import { useEffect, useState } from "react";
import { NCSF_CPT, NCSF_LESSONS, lessonOf } from "@/lib/ncsf-cpt";

type Question = { q: string; options: string[]; answer: number; explain: string; page: number; evidence: string; source?: "image" };
type Chapter = { ch: number; questions: Question[] };

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
  const [only, setOnly] = useState<number[] | null>(null); // retry-wrong subset
  const [orders, setOrders] = useState<number[][]>([]);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/ncsf/quiz")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { chapters: Chapter[] }) => {
        setChapters(d.chapters);
        setOrders(shuffled(d.chapters[0].questions));
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="alert-error">Không tải được đề. Thử tải lại trang hoặc đăng nhập lại.</p>;
  if (!chapters) return <p className="text-sm text-slate">Đang tải đề…</p>;

  const chapter = chapters.find((c) => c.ch === ch)!;
  const source = NCSF_CPT[ch - 1];
  const lessons = NCSF_LESSONS[ch - 1];
  const items = chapter.questions
    .map((q, idx) => ({ q, idx, lesson: lessonOf(ch, q.page) }))
    .filter((it) => (lesson < 0 || it.lesson === lesson) && (!only || only.includes(it.idx)));
  const wrong = items.filter((it) => picked[it.idx] !== it.q.answer).map((it) => it.idx);

  const start = (nextCh: number, nextLesson: number, subset: number[] | null) => {
    setCh(nextCh);
    setLesson(nextLesson);
    setOnly(subset);
    setOrders(shuffled(chapters.find((c) => c.ch === nextCh)!.questions));
    setPicked({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn chương">
        {chapters.map((c) => (
          <button key={c.ch} onClick={() => start(c.ch, -1, null)} aria-pressed={c.ch === ch} className={c.ch === ch ? "button-primary" : "button-secondary"}>
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
      {only && <p className="text-sm font-semibold text-caution">Đang làm lại {only.length} câu sai.</p>}

      <ol className="space-y-4">
        {items.map(({ q, idx }, n) => {
          const order = orders[idx] ?? [0, 1, 2, 3];
          return (
            <li key={`${ch}-${idx}`}>
              <fieldset className="rounded-lg border border-rule p-4">
                <legend className="px-1 text-sm font-semibold text-ink">
                  Câu {n + 1}. {q.q}
                </legend>
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
                    <p className="text-slate">
                      {q.source === "image" ? "Hình trong giáo trình" : "Giáo trình"}: “{q.evidence.replace(/​/g, "")}”{" "}
                      <button className="font-semibold text-cobalt underline" onClick={() => onOpenPage(source.slug, q.page)}>
                        Xem trang {q.page}
                      </button>
                    </p>
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
          <button className="button-primary" onClick={() => setSubmitted(true)}>
            Nộp bài ({items.filter((it) => picked[it.idx] !== undefined).length}/{items.length})
          </button>
        )}
      </div>
    </div>
  );
}
