"use client";

import { useEffect, useState } from "react";
import type { KnowledgeDocument, PubMedPaper } from "@/lib/types";

const PUBMED_PRESETS = [
  "lumbar disc herniation deadlift rehabilitation",
  "beta blocker resistance training perceived exertion",
  "subacromial impingement serratus anterior exercise",
  "visceral adipose tissue zone 2 vs resistance training",
];

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [papers, setPapers] = useState<PubMedPaper[]>([]);

  function load() {
    return fetch("/api/knowledge")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) setError(data.error ?? "Không tải được thư viện");
        else setDocs(data.documents ?? []);
      });
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/knowledge")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ignore) return;
        if (!ok) setError(data.error ?? "Không tải được thư viện");
        else setDocs(data.documents ?? []);
      })
      .catch(() => {
        if (!ignore) setError("Không tải được thư viện");
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function ingest(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("title", title);
      const res = await fetch("/api/ingest", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nạp PDF thất bại");
        return;
      }
      setTitle("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function runSearch(queryText: string) {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("PubMed error");
      const data = await res.json();
      setPapers(data.papers ?? []);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="space-y-4 rounded-lg border border-rule bg-sheet p-5 shadow-xs">
        <div>
          <span className="inline-block rounded bg-cobalt-soft px-2.5 py-0.5 text-xs font-semibold text-cobalt">
            Kho RAG Nội bộ (pgvector)
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            Sách & Giáo trình Chuyên ngành
          </h1>
          <p className="mt-1 text-xs leading-5 text-slate">
            Nạp giáo trình PDF (ACSM Guidelines, NSCA CSCS, NASM CES, Giải phẫu cơ xương khớp).
            Hệ thống tự cắt theo trang và vector hóa 1536 chiều để trích dẫn chính xác.
          </p>
        </div>

        <form className="space-y-3 rounded-md border border-rule bg-canvas/70 p-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block space-y-1 text-xs font-medium text-slate">
            <span>Tên sách / Giáo trình</span>
            <input
              className="w-full px-3 py-2 text-sm"
              placeholder="VD: ACSM Guidelines 11th Edition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-md bg-cobalt px-4 py-2.5 font-display text-xs font-semibold text-white hover:opacity-95">
            {busy ? "Đang cắt trang & tạo Vector..." : "Chọn file PDF để nạp vào kho RAG"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void ingest(f);
              }}
            />
          </label>
        </form>

        {error ? (
          <p className="rounded border border-crimson/30 bg-crimson-soft px-3 py-2 text-xs text-crimson">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate">
            Giáo trình đã nạp ({docs.length})
          </p>
          <ul className="divide-y divide-rule rounded-md border border-rule">
            {docs.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-slate">
                Chưa có sách PDF nào trong kho. Khi kết nối Supabase + OpenRouter, sách bạn tải lên sẽ hiển thị tại đây.
              </li>
            ) : (
              docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-ink">{d.title}</p>
                    <p className="text-xs text-slate">{d.page_count ?? "?"} trang</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-crimson hover:underline"
                    onClick={async () => {
                      await fetch(`/api/knowledge?id=${d.id}`, { method: "DELETE" });
                      await load();
                    }}
                  >
                    Xóa
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-rule bg-sheet p-5 shadow-xs">
        <div>
          <span className="inline-block rounded bg-cleared-soft px-2.5 py-0.5 text-xs font-semibold text-cleared">
            NCBI E-utilities Live
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
            Tra cứu Nghiên cứu Y học Thể thao (PubMed)
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate">
            Tìm trực tiếp các bài báo khoa học, Systematic Review và hướng dẫn phục hồi chức năng lâm sàng.
            Có thể gõ tiếng Việt hoặc thuật ngữ tiếng Anh.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch(q);
          }}
          className="flex gap-2"
        >
          <input
            aria-label="Từ khóa tìm kiếm PubMed"
            className="flex-1 px-3.5 py-2 text-sm"
            placeholder="VD: thoát vị đĩa đệm deadlift, subacromial impingement..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-md bg-cobalt px-5 py-2 font-display text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {searching ? "Đang tìm..." : "Tìm PubMed"}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {PUBMED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setQ(preset);
                void runSearch(preset);
              }}
              className="rounded-full border border-rule bg-canvas px-3 py-1 text-xs text-slate hover:border-cobalt hover:text-cobalt"
            >
              {preset}
            </button>
          ))}
        </div>

        <ul className="space-y-3 pt-1">
          {papers.map((p) => (
            <li key={p.pmid} className="rounded-md border border-rule bg-canvas/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-cobalt-soft px-2 py-0.5 font-mono text-xs font-semibold text-cobalt">
                  PMID {p.pmid} • {p.year}
                </span>
                <span className="text-xs font-medium text-slate">{p.journal}</span>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block font-display text-base font-bold text-ink hover:text-cobalt"
              >
                {p.title}
              </a>
              {p.authors && <p className="mt-0.5 text-xs text-slate">{p.authors}</p>}
              {p.abstract ? (
                <p className="mt-2 text-xs leading-6 text-ink">{p.abstract}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
