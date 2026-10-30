"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { NcsfMockExams, type NcsfMockExamsHandle } from "@/components/NcsfMockExams";
import { NcsfQuiz } from "@/components/NcsfQuiz";
import { NcsfPageCorrections } from "@/components/NcsfCorrections";
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
    <section className="panel grid max-w-5xl overflow-hidden lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]" aria-label="Truy cập thư viện NCSF">
      <form
        className="space-y-4 self-start p-5 sm:p-7"
        aria-label="Đăng nhập thư viện NCSF"
        aria-busy={busy}
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
        <h2 className="text-base font-semibold text-ink">Đăng nhập để học</h2>
        <p className="text-sm leading-6 text-slate">Tài liệu NCSF chỉ dành cho người có quyền truy cập. Nhập mật khẩu để tiếp tục.</p>
        <label className="block">
          <span className="field-label">Mật khẩu</span>
          <input type="password" autoComplete="current-password" required disabled={busy} className="min-h-11 w-full px-3 text-sm" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
        </label>
        {error && <p className="alert-error" role="alert">{error}</p>}
        <button type="submit" className="button-primary w-full" disabled={busy}>
          <Icon name={busy ? "spinner" : "book"} className={`size-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Đang kiểm tra…" : "Đăng nhập"}
        </button>
      </form>
      <div className="border-t border-rule bg-cobalt-soft/40 p-5 sm:p-7 lg:border-l lg:border-t-0">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Một chỗ để đọc, ôn và tự kiểm tra.</h2>
        <p className="mt-3 max-w-prose text-sm leading-7 text-slate">Chọn cách học phù hợp sau khi đăng nhập. Tài liệu và đề thi được mở trong thư viện riêng tư.</p>
        <dl className="mt-5 divide-y divide-rule text-sm">
          {[
            ["Đọc giáo trình", "Chọn chương, bài và mở trang cần tra cứu."],
            ["Đề thi nhỏ", "Ôn theo chương và xem lại trang được trích dẫn."],
            ["Đề thi thử", "Luyện tập với bộ đề trong thư viện."],
          ].map(([title, detail]) => (
            <div key={title} className="py-3 first:pt-0 last:pb-0">
              <dt className="font-semibold text-ink">{title}</dt>
              <dd className="mt-1 leading-6 text-slate">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function NcsfLibraryPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ncsf/session", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: unknown) => {
        if (controller.signal.aborted) return;
        if (!data || typeof data !== "object" || !("authed" in data) || typeof data.authed !== "boolean") throw new Error("Invalid session response");
        setAuthed(data.authed);
      })
      .catch(() => { if (!controller.signal.aborted) setSessionError("Không kiểm tra được quyền truy cập. Kiểm tra kết nối rồi thử lại."); });
    return () => controller.abort();
  }, [sessionCheckAttempt]);
  const logout = async () => {
    setLoggingOut(true);
    setSessionError("");
    try {
      const response = await fetch("/api/ncsf/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Logout failed");
      setAuthed(false);
    } catch {
      setSessionError("Chưa đăng xuất được. Kiểm tra kết nối rồi chọn Đăng xuất lần nữa.");
    } finally {
      setLoggingOut(false);
    }
  };

  const heading = (
    <>
      <PageHeading

        title="Giáo trình NCSF CPT tiếng Việt."
        description="Tài liệu học viên từ NCSF Việt Nam, lưu riêng tư và chỉ mở sau khi đăng nhập."
      >
        <a href={NCSF_SOURCE} target="_blank" rel="noreferrer" className="button-secondary">
          Nguồn gốc
          <Icon name="external" className="size-4" />
        </a>
        {authed && (
          <button className="button-secondary" disabled={loggingOut} onClick={logout}>
            {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
          </button>
        )}
      </PageHeading>
      {authed && sessionError && <p className="alert-error" role="alert">{sessionError}</p>}
    </>
  );

  if (!authed)
    return (
      <div className="space-y-7">
        {heading}
        {authed === null ? sessionError ? (
          <div className="space-y-3">
            <p className="alert-error" role="alert">{sessionError}</p>
            <button type="button" className="button-secondary" onClick={() => { setSessionError(""); setSessionCheckAttempt(attempt => attempt + 1); }}>Kiểm tra lại quyền truy cập</button>
          </div>
        ) : <div className="flex min-h-40 items-center gap-3 text-sm text-slate" role="status"><Icon name="spinner" className="size-5 animate-spin" />Đang kiểm tra quyền truy cập…</div> : <LoginForm onDone={() => { setSessionError(""); setAuthed(true); }} />}
      </div>
    );
  return <NcsfContent heading={heading} onSessionExpired={() => setAuthed(false)} />;
}

function NcsfContent({ heading, onSessionExpired }: { heading: React.ReactNode; onSessionExpired?: () => void }) {
  const [view, setView] = useState<"read" | "quiz" | "mock">("read");
  const [quizOpened, setQuizOpened] = useState(false);
  const [readingCitation, setReadingCitation] = useState(false);
  const [mockOpened, setMockOpened] = useState(false);
  const mockRef = useRef<NcsfMockExamsHandle | null>(null);
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
    setCurrentPage(p);
    setReadingCitation(true);
    setView("read");
  };

  return (
    <div className="space-y-7 [&_.page-description]:max-sm:hidden">
      {heading}
      <div className="tab-bar" aria-label="Chế độ học">
        <button type="button" aria-pressed={view === "read"} className="tab-button" onClick={() => setView("read")}>
          Đọc giáo trình
        </button>
        <button type="button" aria-pressed={view === "quiz"} className="tab-button" onClick={() => { setQuizOpened(true); setView("quiz"); }}>
          Đề thi nhỏ
        </button>
        <button type="button" aria-pressed={view === "mock"} className="tab-button" onClick={() => { mockRef.current?.reshuffle(); setMockOpened(true); setView("mock"); }}>
          Đề thi thử
        </button>
      </div>
      {mockOpened && (
        <section hidden={view !== "mock"} className="panel min-w-0 p-4 sm:p-5" aria-label="Đề thi thử">
          <NcsfMockExams apiRef={mockRef} />
        </section>
      )}
      {quizOpened && (
        <section hidden={view !== "quiz"} className="panel min-w-0 p-4 sm:p-5" aria-label="Đề thi nhỏ">
          <NcsfQuiz onOpenPage={open} onSessionExpired={onSessionExpired} />
        </section>
      )}
      {view === "read" && (
        <div className="space-y-4">
          {readingCitation && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate">Đáp án và kết quả của bài đang làm vẫn được giữ trong phiên này.</p>
              <button type="button" className="button-primary" onClick={() => setView("quiz")}>Quay lại bài đang làm</button>
            </div>
          )}
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
              {chapterIndex >= 0 && chapterIndex < 8 && <NcsfPageCorrections chapter={chapterIndex + 1} page={currentPage} />}
              <PdfReader
                key={slug}
                file={`/api/ncsf/${slug}`}
                startPage={startPage}
                apiRef={readerRef}
                onPageChange={setCurrentPage}
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
