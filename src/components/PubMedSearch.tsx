"use client";

import { useRef, useState } from "react";
import { EmptyState, Icon, SectionHeading } from "@/components/WorkspaceUI";
import type { PubMedPaper } from "@/lib/types";

const PUBMED_PRESETS = [
  {
    label: "Đĩa đệm & deadlift",
    query: "lumbar disc herniation deadlift rehabilitation",
  },
  {
    label: "Thuốc chẹn beta & tập sức mạnh",
    query: "beta blocker resistance training perceived exertion",
  },
  {
    label: "Phục hồi vai",
    query: "subacromial impingement serratus anterior exercise",
  },
  {
    label: "Mỡ nội tạng & tập luyện",
    query: "visceral adipose tissue zone 2 vs resistance training",
  },
];

function feedbackError(error: unknown, fallback: string) {
  if (error instanceof TypeError || error instanceof SyntaxError)
    return fallback;
  return error instanceof Error ? error.message : fallback;
}

export function PubMedSearch() {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [q, setQ] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [papers, setPapers] = useState<PubMedPaper[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  async function runSearch(queryText: string) {
    const trimmed = queryText.trim();
    if (!trimmed || searching) return;
    setQ(trimmed);
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? "Không thể tra cứu PubMed lúc này.");
      setPapers(data.papers ?? []);
      setLastQuery(trimmed);
      resultsHeading.current?.focus();
    } catch (error) {
      setSearchError(
        feedbackError(
          error,
          "Không thể kết nối PubMed. Kiểm tra kết nối và thử lại sau.",
        ),
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <section
      className="panel order-first min-w-0 overflow-hidden xl:order-none"
      aria-label="Tra cứu nghiên cứu PubMed"
    >
      <div className="border-b border-rule p-5 sm:p-6">
        <SectionHeading number="02" title="Tra cứu PubMed">
          <span className="badge">Nguồn NCBI</span>
        </SectionHeading>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
          Từ câu hỏi đến bằng chứng.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate">
          Tìm bài báo, tổng quan hệ thống và nghiên cứu phục hồi chức năng. Dùng
          thuật ngữ tiếng Anh để tìm được nhiều nghiên cứu phù hợp hơn.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch(q);
          }}
          className="mt-5 space-y-2"
          aria-busy={searching}
        >
          <label htmlFor="pubmed-query" className="field-label">
            Chủ đề hoặc câu hỏi nghiên cứu
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="input-with-icon min-w-0 flex-1">
              <Icon name="search" className="size-4 text-slate" />
              <input
                ref={searchInput}
                id="pubmed-query"
                className="min-h-11 w-full min-w-0 text-sm"
                placeholder="VD: low back pain resistance training"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={searching || !q.trim()}
              className="button-primary shrink-0"
            >
              <Icon
                name={searching ? "spinner" : "search"}
                className={`size-4 ${searching ? "animate-spin" : ""}`}
              />
              {searching ? "Đang tìm…" : "Tìm nghiên cứu"}
            </button>
          </div>
        </form>
        <p className="mb-2 mt-4 text-xs text-slate">Khám phá nhanh</p>
        <div className="flex flex-wrap gap-2">
          {PUBMED_PRESETS.map((preset) => (
            <button
              key={preset.query}
              type="button"
              onClick={() => {
                setQ(preset.query);
                void runSearch(preset.query);
              }}
              disabled={searching}
              className="min-h-10 rounded-lg border border-rule bg-canvas px-3 py-2 text-left text-xs leading-5 text-slate transition-colors hover:border-cobalt hover:text-cobalt disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <h3
          ref={resultsHeading}
          tabIndex={-1}
          className="break-words text-sm font-semibold leading-6 text-ink"
        >
          {lastQuery ? `Kết quả cho “${lastQuery}”` : "Kết quả nghiên cứu"}
        </h3>
        <div aria-live="polite" className="mt-3">
          {searching && (
            <p className="flex items-center gap-2 py-4 text-sm text-slate">
              <Icon name="spinner" className="size-4 animate-spin" />
              Đang tìm nghiên cứu trên PubMed…
            </p>
          )}
          {searchError && (
            <div className="alert-error" role="alert">
              <p>{searchError}</p>
              <p className="mt-1">
                Kiểm tra từ khóa hoặc thử lại sau.
                {lastQuery
                  ? " Kết quả tìm kiếm trước vẫn được giữ bên dưới."
                  : ""}
              </p>
            </div>
          )}
          {!lastQuery && !searching && !searchError && (
            <EmptyState icon="search" title="Bạn đang tìm hiểu chủ đề nào?">
              Nhập từ khóa hoặc chọn một chủ đề gợi ý. Mỗi kết quả sẽ có liên
              kết đến bài gốc để bạn đối chiếu.
            </EmptyState>
          )}
          {lastQuery && !searching && !papers.length && !searchError && (
            <EmptyState
              icon="book"
              title="Chưa tìm thấy nghiên cứu phù hợp"
              action={
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => searchInput.current?.focus()}
                >
                  Điều chỉnh từ khóa
                </button>
              }
            >
              Thử dùng thuật ngữ rộng hơn hoặc thay đổi tên bệnh lý, loại bài
              tập.
            </EmptyState>
          )}
          {lastQuery && papers.length > 0 && !searching && (
            <p className="mb-4 text-xs text-slate">
              {papers.length} bài báo được trả về · Đọc và đối chiếu với bối
              cảnh học viên.
            </p>
          )}
        </div>
        <ol className="space-y-4">
          {papers.map((paper, index) => (
            <li
              key={paper.pmid}
              className="min-w-0 rounded-xl border border-rule p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-cobalt">
                  {String(index + 1).padStart(2, "0")} / PMID {paper.pmid}
                </span>
                <span className="text-slate">{paper.year}</span>
              </div>
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-start gap-2 text-base font-semibold leading-7 text-ink hover:text-cobalt"
              >
                <span className="min-w-0 break-words">{paper.title}</span>
                <Icon name="external" className="mt-1 size-4 text-cobalt" />
                <span className="sr-only">(mở trong tab mới)</span>
              </a>
              <p className="mt-2 break-words text-xs leading-5 text-slate">
                {paper.journal}
                {paper.authors ? ` · ${paper.authors}` : ""}
              </p>
              {paper.abstract ? (
                <details className="mt-4 border-t border-rule pt-2">
                  <summary className="min-h-10 cursor-pointer py-2 text-xs font-semibold text-cobalt">
                    Đọc tóm tắt nghiên cứu
                  </summary>
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-ink">
                    {paper.abstract}
                  </p>
                </details>
              ) : (
                <p className="mt-3 text-xs text-slate">
                  Chưa có tóm tắt. Mở bài gốc để xem chi tiết.
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
