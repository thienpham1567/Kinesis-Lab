"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Icon } from "./WorkspaceUI";

// Must be set in the same module that renders <Document> (react-pdf README).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];
type Zoom = "fit" | number;

export type PdfReaderHandle = { jumpTo: (page: number) => void };

/* Số trang kề bên được vẽ sẵn quanh trang đang đọc. Trang xa chỉ giữ khung
   trắng đúng chiều cao, để cuộn không giật và không tốn bộ nhớ. */
const WINDOW_BEFORE = 2;
const WINDOW_AFTER = 4;

export default function PdfReader({
  file,
  startPage = 1,
  apiRef,
  onPageChange,
}: {
  file: string;
  startPage?: number;
  apiRef?: React.RefObject<PdfReaderHandle | null>;
  onPageChange?: (page: number) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [ratio, setRatio] = useState(1 / 1.4142); // bề ngang / bề cao, A4 tạm thời
  const [current, setCurrent] = useState(1);
  const [draft, setDraft] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Zoom>("fit");
  const [scrollPct, setScrollPct] = useState(0);
  const pendingJump = useRef<number | null>(null);
  const pendingRestore = useRef<number | null>(null);
  const restored = useRef(false);
  const zoomAnchor = useRef<number | null>(null);
  const currentRef = useRef(1);
  const prevWidth = useRef(0);
  const lastScrollCmdAt = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  /* Khung đổi cỡ (xoay máy, toàn màn hình, thu phóng): giữ nguyên trang
     đang đọc thay vì giữ nguyên số pixel đã cuộn. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (
        prevWidth.current > 0 &&
        Math.abs(w - prevWidth.current) > 2 &&
        restored.current &&
        performance.now() - lastScrollCmdAt.current > 1000
      ) {
        zoomAnchor.current = currentRef.current;
      }
      prevWidth.current = w;
      setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollToPage = useCallback((n: number, smooth = true) => {
    lastScrollCmdAt.current = performance.now();
    const el = box.current;
    const slot = el?.querySelector<HTMLElement>(`[data-page="${n}"]`);
    if (!el || !slot) return;
    el.scrollTo({
      top: Math.max(slot.offsetTop - 12, 0),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Trang cha nhảy trang qua apiRef (mục lục bài, đề thi).
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      jumpTo: (n: number) => {
        restored.current = true;
        if (pages > 0) scrollToPage(Math.min(Math.max(n, 1), pages));
        else pendingJump.current = n;
      },
    };
  }, [apiRef, pages, scrollToPage]);

  useEffect(() => {
    onPageChange?.(current);
    if (pages > 0 && restored.current && pendingRestore.current === null) {
      localStorage.setItem(`ncsf-page:${file}`, String(current));
    }
  }, [current, pages, file, onPageChange]);

  /* Cuộn tới đâu, trang hiện tại và cửa sổ vẽ theo tới đó. */
  const handleScroll = useCallback(() => {
    const el = box.current;
    if (!el || pages === 0) return;
    const max = el.scrollHeight - el.clientHeight;
    setScrollPct(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
    const probe = el.scrollTop + 90;
    let found = 1;
    for (const slot of el.querySelectorAll<HTMLElement>("[data-page]")) {
      if (slot.offsetTop <= probe) found = Number(slot.dataset.page) || found;
      else break;
    }
    setCurrent((prev) => (prev === found ? prev : found));
  }, [pages]);

  useEffect(() => {
    if (pages === 0) return;
    const raf = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(raf);
  }, [pages, width, zoom, handleScroll]);

  /* Sau khi đổi thu phóng, giữ nguyên trang đang đọc. */
  useEffect(() => {
    if (zoomAnchor.current === null) return;
    const target = zoomAnchor.current;
    zoomAnchor.current = null;
    const raf = requestAnimationFrame(() => scrollToPage(target, false));
    return () => cancelAnimationFrame(raf);
  }, [zoom, width, scrollToPage]);

  const handleLoad = async (pdf: {
    numPages: number;
    getPage: (n: number) => Promise<{
      getViewport: (o: { scale: number }) => { width: number; height: number };
    }>;
  }) => {
    setPages(pdf.numPages);
    try {
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      if (vp.height > 0) setRatio(vp.width / vp.height);
    } catch {
      /* Giữ tỉ lệ A4 tạm thời nếu không đọc được trang đầu. */
    }
    if (restored.current) return;
    restored.current = true;
    const target =
      pendingJump.current ??
      (startPage > 1
        ? startPage
        : Number(localStorage.getItem(`ncsf-page:${file}`)) || 1);
    pendingJump.current = null;
    if (target > 1) pendingRestore.current = Math.min(target, pdf.numPages);
  };

  /* Chờ các khung trang dựng xong mới cuộn tới trang cần khôi phục. */
  useEffect(() => {
    if (pages === 0 || pendingRestore.current === null) return;
    const target = pendingRestore.current;
    if (!box.current?.querySelector(`[data-page="${target}"]`)) return;
    pendingRestore.current = null;
    scrollToPage(target, false);
  }, [pages, width, scrollToPage]);

  const commitPageInput = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (Number.isFinite(n) && n >= 1 && pages > 0)
      scrollToPage(Math.min(n, pages));
    setDraft(null);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrap.current?.requestFullscreen().catch(() => {});
  };

  const pageWidth = Math.max((width - 32) * (zoom === "fit" ? 1 : zoom), 0);
  const slotHeight = ratio > 0 ? pageWidth / ratio : 0;

  return (
    <div ref={wrap} className="pdf-reader-wrap flex min-w-0 flex-col gap-3 bg-sheet">
      <div className="sticky top-16 z-10 -my-1 flex flex-wrap items-center gap-2 bg-sheet py-1 lg:top-24">
        <button
          type="button"
          className="icon-button"
          onClick={() => scrollToPage(current - 1)}
          disabled={current <= 1}
          aria-label="Trang trước"
        >
          <Icon name="arrow-left" className="size-4" />
        </button>
        <form
          className="flex items-center gap-1.5 text-sm text-slate"
          onSubmit={(e) => {
            e.preventDefault();
            commitPageInput();
          }}
        >
          <label htmlFor="pdf-page-input">Trang</label>
          <input
            id="pdf-page-input"
            type="number"
            min={1}
            max={pages || 1}
            value={draft ?? String(current)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitPageInput}
            className="min-h-10 w-16 px-2 text-center text-sm"
          />
          <span aria-live="polite">/ {pages || "…"}</span>
        </form>
        <button
          type="button"
          className="icon-button"
          onClick={() => scrollToPage(current + 1)}
          disabled={!pages || current >= pages}
          aria-label="Trang sau"
        >
          <Icon name="arrow-right" className="size-4" />
        </button>
        {pages > 0 && (
          <span className="text-xs tabular-nums text-slate" aria-live="polite">
            Đã đọc {scrollPct}%
          </span>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-sm text-slate">
          Thu phóng
          <select
            value={String(zoom)}
            onChange={(e) => {
              zoomAnchor.current = current;
              setZoom(e.target.value === "fit" ? "fit" : Number(e.target.value));
            }}
            className="min-h-10 px-2 text-sm"
          >
            <option value="fit">Vừa màn</option>
            {ZOOMS.map((z) => (
              <option key={z} value={z}>
                {z * 100}%
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="icon-button"
          onClick={toggleFullscreen}
          aria-label="Đọc toàn màn hình"
        >
          <Icon name="expand" className="size-4" />
        </button>
        <a
          className="icon-button"
          href={file}
          target="_blank"
          rel="noreferrer"
          aria-label="Mở PDF trong tab mới"
        >
          <Icon name="external" className="size-4" />
        </a>
      </div>
      {pages > 0 && (
        <div
          className="h-1 overflow-hidden rounded bg-rule/60"
          role="progressbar"
          aria-label="Tiến độ đọc"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={scrollPct}
        >
          <div
            className="h-full bg-cobalt transition-[width] duration-150"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      )}
      <div
        ref={box}
        onScroll={handleScroll}
        className="pdf-scroll-box relative h-[72dvh] overflow-auto scroll-smooth rounded-lg border border-rule bg-surface [overflow-anchor:none] focus:outline-2 focus:outline-cobalt lg:h-[calc(100dvh-14rem)]"
        aria-label="Nội dung PDF. Cuộn để đọc liền các trang."
      >
        {/* suspense={false}: trang mới hiện bằng khung chờ riêng, không treo
            cả khung đọc (treo sẽ làm mất vị trí cuộn). */}
        <Document
          file={file}
          suspense={false}
          onLoadSuccess={handleLoad}
          loading={<p className="p-6 text-sm text-slate">Đang tải PDF…</p>}
          error={
            <p className="alert-error m-4">
              Không mở được PDF. Thử tải lại trang hoặc đăng nhập lại.
            </p>
          }
        >
          <div className="flex flex-col items-center gap-5 p-4">
            {pages > 0 &&
              pageWidth > 0 &&
              Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                const inWindow =
                  p >= current - WINDOW_BEFORE && p <= current + WINDOW_AFTER;
                return (
                  <div
                    key={p}
                    data-page={p}
                    className="relative shrink-0 overflow-hidden rounded-sm bg-white shadow-[0_2px_14px_rgb(26_45_64/0.16)]"
                    style={{ width: pageWidth, height: slotHeight }}
                  >
                    {inWindow ? (
                      <Page
                        pageNumber={p}
                        width={pageWidth}
                        loading={
                          <p className="p-6 text-center text-sm text-slate">
                            Đang tải trang {p}…
                          </p>
                        }
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate/60">
                        Trang {p}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </Document>
      </div>
    </div>
  );
}
