"use client";

import { useEffect, useRef, useState } from "react";
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
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Zoom>("fit");
  const [rendering, setRendering] = useState(true);
  const pendingJump = useRef<number | null>(null);
  const restored = useRef(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = (n: number) => Math.min(Math.max(n, 1), pages || 1);

  const changePage = (n: number) => {
    setRendering(true);
    setPage(clamp(n));
  };

  // Trang cha nhảy trang qua apiRef (mục lục bài, đề thi). Tài liệu chưa tải
  // xong thì giữ lại, áp trong handleLoad.
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      jumpTo: (n: number) => {
        restored.current = true;
        if (pages > 0) {
          setRendering(true);
          setPage(Math.min(Math.max(n, 1), pages));
        } else {
          pendingJump.current = n;
        }
      },
    };
  }, [apiRef, pages]);

  useEffect(() => {
    box.current?.scrollTo({ top: 0, left: 0 });
  }, [page]);

  useEffect(() => {
    onPageChange?.(page);
    if (pages > 0) localStorage.setItem(`ncsf-page:${file}`, String(page));
  }, [page, pages, file, onPageChange]);

  const handleLoad = ({ numPages }: { numPages: number }) => {
    setPages(numPages);
    if (pendingJump.current !== null) {
      setRendering(true);
      setPage(Math.min(Math.max(pendingJump.current, 1), numPages));
      pendingJump.current = null;
      restored.current = true;
      return;
    }
    if (restored.current) return;
    restored.current = true;
    const target =
      startPage > 1 ? startPage : Number(localStorage.getItem(`ncsf-page:${file}`));
    if (target > 1) {
      setRendering(true);
      setPage(Math.min(target, numPages));
    }
  };

  const commitPageInput = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (Number.isFinite(n) && n >= 1) changePage(n);
    setDraft(null);
  };

  const pageWidth = width * (zoom === "fit" ? 1 : zoom);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="sticky top-16 z-10 -my-1 flex flex-wrap items-center gap-2 bg-sheet py-1 lg:top-24">
        <button
          type="button"
          className="icon-button"
          onClick={() => changePage(page - 1)}
          disabled={page <= 1}
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
            value={draft ?? String(page)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitPageInput}
            className="min-h-10 w-16 px-2 text-center text-sm"
          />
          <span aria-live="polite">/ {pages || "…"}</span>
        </form>
        <button
          type="button"
          className="icon-button"
          onClick={() => changePage(page + 1)}
          disabled={!pages || page >= pages}
          aria-label="Trang sau"
        >
          <Icon name="arrow-right" className="size-4" />
        </button>
        {rendering && pages > 0 && (
          <span className="text-xs text-slate" role="status">
            Đang tải trang…
          </span>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-sm text-slate">
          Thu phóng
          <select
            value={String(zoom)}
            onChange={(e) => {
              setRendering(true);
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
          aria-valuemin={1}
          aria-valuemax={pages}
          aria-valuenow={page}
        >
          <div className="h-full bg-cobalt" style={{ width: `${(page / pages) * 100}%` }} />
        </div>
      )}
      <div
        ref={box}
        tabIndex={0}
        onKeyDown={(e) => {
          const tag = (e.target as HTMLElement).tagName;
          if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
          if (e.key === "ArrowLeft") changePage(page - 1);
          if (e.key === "ArrowRight") changePage(page + 1);
        }}
        className="h-[62dvh] overflow-auto rounded-lg border border-rule bg-surface focus:outline-2 focus:outline-cobalt lg:h-[calc(100dvh-14rem)]"
        aria-label="Nội dung PDF. Dùng phím mũi tên trái và phải để lật trang."
      >
        <Document
          file={file}
          onLoadSuccess={handleLoad}
          loading={<p className="p-6 text-sm text-slate">Đang tải PDF…</p>}
          error={
            <p className="alert-error m-4">
              Không mở được PDF. Thử tải lại trang hoặc đăng nhập lại.
            </p>
          }
        >
          {width > 0 && (
            <Page
              pageNumber={page}
              width={pageWidth}
              className="mx-auto w-fit"
              onRenderSuccess={() => setRendering(false)}
              loading={<p className="p-6 text-sm text-slate">Đang tải trang…</p>}
            />
          )}
        </Document>
      </div>
    </div>
  );
}
