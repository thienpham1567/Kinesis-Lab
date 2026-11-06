"use client";

import { useRef, useState, type ReactNode } from "react";

/** Table values, rather than Markdown delimiters, paste into spreadsheet columns. */
export function tableClipboard(table: HTMLTableElement) {
  return Array.from(table.rows, (row) => Array.from(row.cells, (cell) => {
    const clone = cell.cloneNode(true) as HTMLElement;
    // KaTeX has both visual HTML and accessible MathML; copy its original TeX once.
    clone.querySelectorAll(".katex").forEach((math) => {
      math.replaceWith(math.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? math.textContent ?? "");
    });
    return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
  }).join("\t")).join("\n");
}

export function MarkdownTable({ children, streaming }: { children: ReactNode; streaming: boolean }) {
  const table = useRef<HTMLTableElement>(null);
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      if (!table.current) return;
      await navigator.clipboard.writeText(tableClipboard(table.current));
      setStatus("Đã sao chép bảng");
    } catch {
      setStatus("Chưa sao chép được. Hãy chọn nội dung bảng để sao chép.");
    }
  }
  return (
    <div className="md-table">
      <div className="md-table-tools">
        <button type="button" disabled={streaming} onClick={() => void copy()}>Sao chép bảng</button>
        <span role="status">{status}</span>
      </div>
      <div className="md-table-scroll" role="region" aria-label="Bảng trong câu trả lời" tabIndex={0}>
        <table ref={table}>{children}</table>
      </div>
    </div>
  );
}
