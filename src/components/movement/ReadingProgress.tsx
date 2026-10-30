"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { hash: "key", label: "Kiến thức trọng tâm" },
  { hash: "apply", label: "Áp dụng" },
  { hash: "quiz", label: "Tự kiểm tra" },
  { hash: "sources", label: "Nguồn" },
] as const;

/* Mục lục dính đầu bài kèm thước tiến độ đọc theo vị trí cuộn. */
export function ReadingProgress({ topicId }: { topicId: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const article = document.getElementById(`movement-article-${topicId}`);
    if (!article) return;
    let raf = 0;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const read = Math.min(Math.max(-rect.top + 90, 0), Math.max(total, 1));
      setPct(total > 0 ? Math.round((read / total) * 100) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [topicId]);

  return (
    <nav
      aria-label="Mục lục bài"
      className="sticky top-0 z-20 -mx-1 bg-canvas/95 px-1 py-2 backdrop-blur-md"
    >
      <div className="overflow-hidden rounded-xl border border-rule bg-sheet shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5">
          {LINKS.map((link) => (
            <a
              key={link.hash}
              href={`#movement-${topicId}-${link.hash}`}
              className="inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold text-slate transition-colors hover:bg-cobalt-soft hover:text-cobalt"
            >
              {link.label}
            </a>
          ))}
          <span
            className="ml-auto hidden px-2 font-mono text-[11px] tabular-nums text-slate sm:block"
            aria-live="polite"
          >
            Đã đọc {pct}%
          </span>
        </div>
        <div
          className="h-0.5 bg-rule/50"
          role="progressbar"
          aria-label="Tiến độ đọc bài"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div
            className="h-full bg-gradient-to-r from-cobalt via-mark to-ember transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
