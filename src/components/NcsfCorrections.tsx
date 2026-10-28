"use client";

import { useEffect, useState } from "react";
import { pageCorrections, parseNcsfQuiz, type NcsfQuizData, type NcsfReference } from "@/lib/ncsf-quiz";

export function NcsfSourceLinks({ references }: { references: NcsfReference[] }) {
  if (!references.length) return null;
  return <ul className="space-y-2 border-t border-rule pt-2 text-slate" aria-label="Nguồn đối chiếu">
    {references.map(reference => <li key={`${reference.url}-${reference.title}-${reference.checkedAt}`}>
      <a className="font-semibold text-cobalt underline [overflow-wrap:anywhere]" href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a>
      <span className="block text-xs">{reference.scope === "full-text" ? "Toàn văn / mục được dẫn" : reference.scope === "abstract" ? "Tóm tắt nghiên cứu" : "Trích đoạn"} · Đối chiếu {reference.checkedAt}</span>
    </li>)}
  </ul>;
}

export function NcsfPageCorrections({ chapter, page }: { chapter: number; page: number }) {
  const [bank, setBank] = useState<NcsfQuizData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ncsf/quiz", { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(value => {
        const data = parseNcsfQuiz(value);
        if (!data) throw new Error("Invalid question data");
        if (!controller.signal.aborted) setBank(data);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  if (failed) return <p className="mb-3 text-sm text-slate">Chưa tải được ghi chú đối chiếu. Tải lại trang hoặc đăng nhập lại để xem phần đính chính.</p>;
  if (!bank) return null;
  const notes = pageCorrections(bank, chapter, page);
  if (!notes.length) return null;
  return <aside className="mb-4 rounded-lg border border-rule bg-surface p-3 text-sm" aria-label="Đính chính trang đang đọc">
    <details open>
      <summary className="cursor-pointer font-semibold text-ink">Đính chính / phạm vi · Trang {page} ({notes.length})</summary>
      <div className="mt-3 space-y-3">
        {notes.map(note => <div key={note.text} className="space-y-2"><p className="text-ink">{note.text}</p><NcsfSourceLinks references={note.references} /></div>)}
      </div>
    </details>
  </aside>;
}
