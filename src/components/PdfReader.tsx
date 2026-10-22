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

export default function PdfReader({ file, initialPage = 1 }: { file: string; initialPage?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = (n: number) => setPage((p) => Math.min(Math.max(p + n, 1), pages || 1));

  return (
    <div
      className="flex min-w-0 flex-col gap-3"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button className="icon-button" onClick={() => go(-1)} disabled={page <= 1} aria-label="Trang trước">
          <Icon name="arrow-left" className="size-4" />
        </button>
        <label className="flex items-center gap-1.5 text-sm text-slate">
          Trang
          <input
            type="number"
            min={1}
            max={pages || 1}
            value={page}
            onChange={(e) => setPage(Math.min(Math.max(Number(e.target.value) || 1, 1), pages || 1))}
            className="min-h-10 w-16 px-2 text-center text-sm"
          />
          / {pages || "…"}
        </label>
        <button className="icon-button" onClick={() => go(1)} disabled={page >= pages} aria-label="Trang sau">
          <Icon name="arrow-right" className="size-4" />
        </button>
        <label className="ml-auto flex items-center gap-1.5 text-sm text-slate">
          Thu phóng
          <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="min-h-10 px-2 text-sm">
            {ZOOMS.map((z) => (
              <option key={z} value={z}>{z * 100}%</option>
            ))}
          </select>
        </label>
        <a className="icon-button" href={file} target="_blank" rel="noreferrer" aria-label="Mở PDF trong tab mới">
          <Icon name="external" className="size-4" />
        </a>
      </div>
      <div ref={box} tabIndex={0} className="min-h-[60vh] overflow-auto rounded-lg border border-rule bg-surface" aria-label="Nội dung PDF">
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={<p className="p-6 text-sm text-slate">Đang tải PDF…</p>}
          error={
            <p className="alert-error m-4">
              Không mở được PDF. Thử tải lại trang hoặc đăng nhập lại.
            </p>
          }
        >
          {width > 0 && <Page pageNumber={page} width={width * zoom} className="mx-auto w-fit" />}
        </Document>
      </div>
    </div>
  );
}
