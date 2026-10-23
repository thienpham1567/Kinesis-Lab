"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NcsfQuiz } from "@/components/NcsfQuiz";
import { Icon, PageHeading } from "@/components/WorkspaceUI";
import { NCSF_CPT, NCSF_LESSONS, NCSF_SOURCE, lessonOf } from "@/lib/ncsf-cpt";
import type { PdfReaderHandle } from "@/components/PdfReader";

// pdf.js needs browser APIs, so skip SSR.
const PdfReader = dynamic(() => import("@/components/PdfReader"), { ssr: false });

function LoginForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="panel max-w-md space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/ncsf/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }).catch(() => null);
        setBusy(false);
        if (res?.ok) onDone();
        else setError(res?.status === 401 ? "Sai mật khẩu." : "Không kết nối được máy chủ.");
      }}
    >
      <p className="text-sm text-slate">Tài liệu NCSF chỉ dành cho người có quyền truy cập. Nhập mật khẩu để tiếp tục.</p>
      <label className="block">
        <span className="field-label">Mật khẩu</span>
        <input type="password" autoComplete="current-password" required className="min-h-11 w-full px-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="alert-error" role="alert">{error}</p>}
      <button className="button-primary" disabled={busy}>
        {busy ? "Đang kiểm tra…" : "Đăng nhập"}
      </button>
    </form>
  );
}

export default function NcsfLibraryPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/ncsf/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);
  const logout = async () => {
    await fetch("/api/ncsf/session", { method: "DELETE" });
    setAuthed(false);
  };

  const heading = (
    <PageHeading
      eyebrow="THƯ VIỆN / NCSF CPT"
      title="Giáo trình NCSF CPT tiếng Việt."
      description="Tài liệu học viên từ NCSF Việt Nam, lưu riêng tư và chỉ mở sau khi đăng nhập."
    >
      <a href={NCSF_SOURCE} target="_blank" rel="noreferrer" className="button-secondary">
        Nguồn gốc
        <Icon name="external" className="size-4" />
      </a>
      {authed && (
        <button className="button-secondary" onClick={logout}>
          Đăng xuất
        </button>
      )}
    </PageHeading>
  );

  if (!authed)
    return (
      <div className="space-y-7">
        {heading}
        {authed === null ? <p className="text-sm text-slate">Đang kiểm tra quyền truy cập…</p> : <LoginForm onDone={() => setAuthed(true)} />}
      </div>
    );
  return <NcsfContent heading={heading} />;
}

function NcsfContent({ heading }: { heading: React.ReactNode }) {
  const [view, setView] = useState<"read" | "quiz">("read");
  const [slug, setSlug] = useState<string>(NCSF_CPT[0].slug);
  const [startPage, setStartPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const readerRef = useRef<PdfReaderHandle | null>(null);
  const chapterIndex = NCSF_CPT.findIndex((c) => c.slug === slug);
  const current = NCSF_CPT[chapterIndex] ?? NCSF_CPT[0];
  const lessons =
    chapterIndex >= 0 && chapterIndex < NCSF_LESSONS.length
      ? NCSF_LESSONS[chapterIndex]
      : undefined;
  const activeLesson = lessons ? lessonOf(chapterIndex + 1, currentPage) : -1;

  const openChapter = (s: string) => {
    setSlug(s);
    setStartPage(1);
    setCurrentPage(1);
    setView("read");
  };
  const jumpToPage = (p: number) => readerRef.current?.jumpTo(p);
  const open = (s: string, p = 1) => {
    setSlug(s);
    setStartPage(p);
    setView("read");
  };

  return (
    <div className="space-y-7 [&_.page-description]:max-sm:hidden">
      {heading}
      <div className="tab-bar" aria-label="Chế độ học">
        <button type="button" aria-pressed={view === "read"} className="tab-button" onClick={() => setView("read")}>
          Đọc giáo trình
        </button>
        <button type="button" aria-pressed={view === "quiz"} className="tab-button" onClick={() => setView("quiz")}>
          Đề thi nhỏ
        </button>
      </div>
      {view === "quiz" ? (
        <section className="panel p-4 sm:p-5" aria-label="Đề thi nhỏ">
          <NcsfQuiz onOpenPage={open} />
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
            <label className="block lg:hidden">
              <span className="field-label">Chương</span>
              <select
                value={slug}
                onChange={(e) => openChapter(e.target.value)}
                className="min-h-11 w-full px-3 text-sm"
              >
                {NCSF_CPT.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <nav className="panel hidden p-2 lg:block" aria-label="Chương">
              <ul className="space-y-1">
                {NCSF_CPT.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => openChapter(c.slug)}
                      aria-current={c.slug === slug ? "page" : undefined}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 ${
                        c.slug === slug ? "bg-cobalt-soft font-semibold text-cobalt" : "text-ink hover:bg-surface"
                      }`}
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            {lessons && (
              <section className="panel p-3" aria-label="Bài trong chương">
                <h3 className="px-1 text-sm font-semibold text-ink">Bài trong chương</h3>
                <label className="mt-2 block lg:hidden">
                  <span className="sr-only">Chọn bài</span>
                  <select
                    value={activeLesson}
                    onChange={(e) => {
                      const lesson = lessons[Number(e.target.value)];
                      if (lesson) jumpToPage(lesson.from);
                    }}
                    className="min-h-11 w-full px-3 text-sm"
                  >
                    {lessons.map((l, i) => (
                      <option key={l.title} value={i}>
                        Bài {i + 1} · {l.title} (trang {l.from})
                      </option>
                    ))}
                  </select>
                </label>
                <ul className="mt-2 hidden space-y-1 lg:block">
                  {lessons.map((l, i) => (
                    <li key={l.title}>
                      <button
                        onClick={() => jumpToPage(l.from)}
                        aria-current={i === activeLesson ? "page" : undefined}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 ${
                          i === activeLesson
                            ? "bg-cobalt-soft font-semibold text-cobalt"
                            : "text-ink hover:bg-surface"
                        }`}
                      >
                        Bài {i + 1} · {l.title}
                        <span className="block text-xs font-normal text-slate">
                          Từ trang {l.from}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <section className="panel min-w-0 p-4 sm:p-5" aria-label={current.title}>
            <h2 className="mb-3 text-base font-semibold text-ink">{current.title}</h2>
            <PdfReader
              key={slug}
              file={`/api/ncsf/${slug}`}
              startPage={startPage}
              apiRef={readerRef}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      )}
    </div>
  );
}
