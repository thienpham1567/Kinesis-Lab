"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { NcsfQuiz } from "@/components/NcsfQuiz";
import { Icon, PageHeading } from "@/components/WorkspaceUI";
import { NCSF_CPT, NCSF_SOURCE } from "@/lib/ncsf-cpt";

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
  const [page, setPage] = useState(1);
  const current = NCSF_CPT.find((c) => c.slug === slug) ?? NCSF_CPT[0];
  const open = (s: string, p = 1) => {
    setSlug(s);
    setPage(p);
    setView("read");
  };

  return (
    <div className="space-y-7">
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
          <nav
            className="panel p-2 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto"
            aria-label="Chương"
          >
            <ul className="space-y-1">
              {NCSF_CPT.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => open(c.slug)}
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
          <section className="panel min-w-0 p-4 sm:p-5" aria-label={current.title}>
            <h2 className="mb-3 text-base font-semibold text-ink">{current.title}</h2>
            <PdfReader key={`${slug}-${page}`} file={`/api/ncsf/${slug}`} initialPage={page} />
          </section>
        </div>
      )}
    </div>
  );
}
