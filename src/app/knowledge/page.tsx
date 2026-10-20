"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmptyState,
  Icon,
  PageHeading,
  SectionHeading,
} from "@/components/WorkspaceUI";
import type { KnowledgeDocument } from "@/lib/types";
import { PubMedSearch } from "@/components/PubMedSearch";
import { ClinicalEvidenceIndex } from "@/components/ClinicalEvidenceIndex";

async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const res = await fetch("/api/knowledge");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không tải được thư viện.");
  return data.documents ?? [];
}

function feedbackError(error: unknown, fallback: string) {
  if (error instanceof TypeError || error instanceof SyntaxError)
    return fallback;
  return error instanceof Error ? error.message : fallback;
}

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [libraryMessage, setLibraryMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const libraryHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let ignore = false;
    fetchDocuments()
      .then((documents) => {
        if (!ignore) setDocs(documents);
      })
      .catch((error) => {
        if (!ignore)
          setLibraryError(
            feedbackError(
              error,
              "Không tải được thư viện. Kiểm tra kết nối và thử lại.",
            ),
          );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function reloadLibrary() {
    if (loading || deleting) return;
    setLoading(true);
    setLibraryError("");
    try {
      setDocs(await fetchDocuments());
    } catch (error) {
      setLibraryError(
        feedbackError(
          error,
          "Không tải được thư viện. Kiểm tra kết nối và thử lại.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function ingest(event: React.FormEvent) {
    event.preventDefault();
    if (!file || busy || loading || deleting) return;
    setBusy(true);
    setUploadError("");
    setLibraryMessage("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("title", title);
      const res = await fetch("/api/ingest", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nạp PDF thất bại.");
      setTitle("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setLibraryMessage(
        "Đã nạp tài liệu. Kiểm tra thông tin trong danh sách bên dưới.",
      );
      await reloadLibrary();
    } catch (error) {
      setUploadError(
        feedbackError(error, "Không thể nạp PDF. Kiểm tra kết nối và thử lại."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function deleteDocument(document: KnowledgeDocument) {
    if (
      loading ||
      deleting ||
      busy ||
      !window.confirm(
        `Xóa “${document.title}” khỏi thư viện? Bạn sẽ cần tải lại PDF nếu muốn sử dụng tài liệu này.`,
      )
    )
      return;
    setDeleting(document.id);
    setLibraryError("");
    setLibraryMessage("");
    try {
      const res = await fetch(
        `/api/knowledge?id=${encodeURIComponent(document.id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không xóa được tài liệu.");
      setDocs((current) => current.filter((item) => item.id !== document.id));
      setLibraryMessage(`Đã xóa “${document.title}” khỏi thư viện.`);
      libraryHeading.current?.focus();
    } catch (error) {
      setLibraryError(
        feedbackError(
          error,
          "Không xóa được tài liệu. Kiểm tra kết nối và thử lại.",
        ),
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="THƯ VIỆN / EVIDENCE LIBRARY"
        title="Kiến thức cho từng quyết định."
        description="Lưu giáo trình chuyên ngành và tra cứu nghiên cứu để đối chiếu khi xây dựng chương trình tập luyện."
      />
      <ClinicalEvidenceIndex />
      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section
          className="panel order-last min-w-0 overflow-hidden xl:order-none"
          aria-label="Thư viện PDF"
        >
          <div className="border-b border-rule p-5 sm:p-6">
            <SectionHeading number="01" title="Giáo trình của bạn">
              <Icon name="book" className="size-5 text-slate" />
            </SectionHeading>
            <p className="mt-3 text-sm leading-6 text-slate">
              Nạp PDF để trợ lý tham khảo nội dung và trích dẫn theo trang khi
              trả lời.
            </p>
            <form className="mt-5 space-y-4" onSubmit={ingest} aria-busy={busy}>
              <label className="block">
                <span className="field-label">Tên sách / Giáo trình</span>
                <input
                  className="min-h-11 w-full px-3 text-sm"
                  placeholder="VD: ACSM Guidelines 11th Edition"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="block">
                <span className="field-label">Tài liệu PDF</span>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="min-h-11 w-full min-w-0 max-w-full p-2 text-xs text-slate file:mr-3 file:rounded-md file:border-0 file:bg-cobalt-soft file:px-3 file:py-2 file:font-medium file:text-cobalt"
                  disabled={busy || loading || !!deleting}
                  aria-describedby="pdf-help"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setUploadError("");
                    setLibraryMessage("");
                  }}
                  required
                />
              </label>
              <p id="pdf-help" className="text-xs leading-5 text-slate">
                Nếu để trống tên giáo trình, hệ thống sẽ dùng tên tệp. Quá trình
                nạp có thể mất vài phút.
              </p>
              {uploadError && (
                <p className="alert-error" role="alert">
                  {uploadError}
                </p>
              )}
              <button
                type="submit"
                className="button-primary w-full"
                disabled={!file || busy || loading || !!deleting}
              >
                <Icon
                  name={busy ? "spinner" : "upload"}
                  className={`size-4 ${busy ? "animate-spin" : ""}`}
                />
                {busy ? "Đang xử lý tài liệu…" : "Nạp vào thư viện"}
              </button>
              <p className="sr-only" aria-live="polite">
                {busy ? "Đang xử lý PDF. Vui lòng chờ." : ""}
              </p>
            </form>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3
                ref={libraryHeading}
                tabIndex={-1}
                className="text-sm font-semibold text-ink"
              >
                Tài liệu đã nạp
              </h3>
              <span className="badge font-mono">
                {loading ? "…" : docs.length}
              </span>
            </div>
            <div aria-live="polite" className="mt-4 space-y-3">
              {libraryMessage && (
                <p className="rounded-lg bg-cleared-soft p-3 text-sm leading-6 text-cleared">
                  {libraryMessage}
                </p>
              )}
              {libraryError && (
                <div className="alert-error">
                  <p>{libraryError}</p>
                  <button
                    type="button"
                    className="button-secondary mt-3"
                    onClick={() => void reloadLibrary()}
                    disabled={loading || busy || !!deleting}
                  >
                    <Icon name="refresh" className="size-4" />
                    Tải lại thư viện
                  </button>
                </div>
              )}
              {loading ? (
                <p className="flex items-center gap-2 py-5 text-sm text-slate">
                  <Icon name="spinner" className="size-4 animate-spin" />
                  Đang tải thư viện…
                </p>
              ) : docs.length === 0 && !libraryError ? (
                <EmptyState icon="file" title="Thêm nguồn tham khảo đầu tiên">
                  Giáo trình, hướng dẫn chuyên ngành và tài liệu PDF của bạn sẽ
                  xuất hiện tại đây.
                </EmptyState>
              ) : null}
            </div>
            {docs.length > 0 && (
              <ul className="mt-2 divide-y divide-rule">
                {docs.map((document) => (
                  <li
                    key={document.id}
                    className="flex min-w-0 items-start gap-3 py-4"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-cobalt">
                      <Icon name="file" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium leading-6 text-ink">
                        {document.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate">
                        {document.page_count != null
                          ? `${document.page_count} trang`
                          : "Chưa có số trang"}{" "}
                        · PDF
                      </p>
                      <button
                        type="button"
                        className="mt-1 min-h-10 text-xs font-medium text-crimson hover:underline disabled:opacity-50"
                        onClick={() => void deleteDocument(document)}
                        disabled={loading || !!deleting || busy}
                        aria-label={`Xóa tài liệu ${document.title}`}
                      >
                        {deleting === document.id
                          ? "Đang xóa…"
                          : "Xóa tài liệu"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <PubMedSearch />
      </div>
    </div>
  );
}
