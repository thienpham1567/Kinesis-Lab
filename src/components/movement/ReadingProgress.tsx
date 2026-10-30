"use client";

import { useEffect, useRef, useState } from "react";
import { readingPosition } from "@/lib/ui/reading-position";

const LINKS = [
  { hash: "key", label: "Kiến thức trọng tâm" },
  { hash: "apply", label: "Áp dụng" },
  { hash: "quiz", label: "Tự kiểm tra" },
  { hash: "sources", label: "Nguồn" },
] as const;

/* Mục lục dính đầu bài kèm thước tiến độ đọc theo vị trí cuộn. */
export function ReadingProgress({ topicId }: { topicId: string }) {
  const [position, setPosition] = useState({ percent: 0, activeIndex: 0 });
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const article = document.getElementById(`movement-article-${topicId}`);
    if (!article) return;
    const scroller = article.closest<HTMLElement>("[data-workspace-scroll]");
    const sections = LINKS.map((link) => document.getElementById(`movement-${topicId}-${link.hash}`));
    const bottomNav = document.querySelector<HTMLElement>(".workspace-mobile-nav");
    let raf = 0;
    const update = () => {
      const rect = article.getBoundingClientRect();
      const viewport = scroller?.getBoundingClientRect();
      const bottom = bottomNav?.getBoundingClientRect();
      const next = readingPosition({
        articleTop: rect.top,
        articleBottom: rect.bottom,
        viewportTop: viewport?.top ?? 0,
        viewportBottom: Math.min(viewport?.bottom ?? window.innerHeight, bottom && bottom.height > 0 ? bottom.top : window.innerHeight),
        navHeight: navRef.current?.offsetHeight ?? 0,
        sectionScrollMargin: Math.max(0, ...sections.map((section) => section ? parseFloat(getComputedStyle(section).scrollMarginTop) || 0 : 0)),
        sectionTops: sections.map((section) => section?.getBoundingClientRect().top ?? Infinity),
      });
      setPosition((current) => current.percent === next.percent && current.activeIndex === next.activeIndex ? current : next);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    const scrollTarget = scroller ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new ResizeObserver(onScroll);
    observer.observe(article);
    if (scroller) observer.observe(scroller);
    return () => {
      cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [topicId]);

  return (
    <nav
      ref={navRef}
      aria-label="Mục lục bài"
      className="reading-contents sticky top-0 z-20 -mx-1 bg-canvas/95 px-1 py-2 backdrop-blur-md"
    >
      <div className="overflow-hidden rounded-xl border border-rule bg-sheet shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5">
          {LINKS.map((link, index) => (
            <a
              key={link.hash}
              href={`#movement-${topicId}-${link.hash}`}
              aria-current={position.activeIndex === index ? "location" : undefined}
              className={`inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold transition-colors hover:bg-cobalt-soft hover:text-cobalt ${position.activeIndex === index ? "bg-cobalt-soft text-cobalt underline decoration-2 underline-offset-4" : "text-slate"}`}
            >
              {link.label}
            </a>
          ))}
          <span
            className="ml-auto px-2 text-xs tabular-nums text-slate"
          >
            Vị trí {position.percent}%
          </span>
        </div>
        <div
          className="h-0.5 bg-rule/50"
          role="progressbar"
          aria-label="Vị trí cuộn trong bài"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={position.percent}
        >
          <div
            className="h-full origin-left bg-cobalt transition-transform duration-150"
            style={{ transform: `scaleX(${position.percent / 100})` }}
          />
        </div>
      </div>
    </nav>
  );
}
