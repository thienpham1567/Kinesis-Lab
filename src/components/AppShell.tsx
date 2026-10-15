"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  {
    href: "/",
    label: "Bàn tư vấn",
  },
  {
    href: "/atlas",
    label: "Atlas",
  },
  {
    href: "/clients",
    label: "Học viên",
  },
  {
    href: "/knowledge",
    label: "Y văn",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [health, setHealth] = useState<{ openrouter: boolean; supabase: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => {
        if (!r.ok) throw new Error("health");
        return r.json();
      })
      .then(setHealth)
      .catch(() => setHealth({ openrouter: false, supabase: false }));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-rule bg-sheet/97 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1520px] items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5">
            <KinesisLogo className="size-9 shrink-0 shadow-2xs transition-transform duration-150 group-hover:scale-[1.03]" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[15px] font-bold leading-none tracking-tight text-ink">
                  Kinesis Lab
                </span>
                <span className="hidden rounded bg-cobalt-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-cobalt sm:inline-block">
                  PT·MD
                </span>
              </div>
              <span className="mt-1 hidden text-[11px] leading-none text-slate xl:block">
                Giải phẫu · Cơ sinh học · Lâm sàng
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Điều hướng chính">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? path === "/"
                  : path === item.href || path.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    active
                      ? "bg-cobalt text-white"
                      : "text-slate hover:bg-surface hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <StatusPill
              ok={health?.openrouter}
              label={health?.openrouter ? "OpenRouter" : "Chưa gắn key"}
            />
            <StatusPill
              ok={health?.supabase ? true : null}
              label={health?.supabase ? "Cloud" : "Local"}
            />
          </div>
        </div>

        <nav
          className="grid grid-cols-4 border-t border-rule bg-sheet lg:hidden"
          aria-label="Điều hướng di động"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? path === "/"
                : path === item.href || path.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 text-center text-[11px] font-semibold ${
                  active
                    ? "border-b-2 border-cobalt bg-cobalt-soft/70 text-cobalt"
                    : "text-slate"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 py-5 sm:px-6">{children}</main>

      <footer className="border-t border-rule bg-sheet px-4 py-2 text-[11px] leading-snug text-slate">
        <div className="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span>Phạm vi PT: sàng lọc vận động, điều chỉnh tải & bài tập — không chẩn đoán, không kê đơn.</span>
          <span className="font-semibold text-crimson">
            Cờ đỏ → dừng tập, chuyển khám chuyên khoa
          </span>
        </div>
      </footer>
    </div>
  );
}

function KinesisLogo({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="kl-nav-bg"
          x1="6"
          y1="4"
          x2="58"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#122024" />
          <stop offset="1" stopColor="#0d4696" />
        </linearGradient>
        <linearGradient
          id="kl-nav-vec"
          x1="20"
          y1="14"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#kl-nav-bg)" />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="13"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      {/* Goniometer angle arc */}
      <path
        d="M 38 20 A 16 16 0 0 1 38 44"
        stroke="#93c5fd"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
      />
      {/* Vertebral / anatomical vertical axis (left stem of K) */}
      <line
        x1="20"
        y1="15"
        x2="20"
        y2="49"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="16.5" r="3" fill="#ffffff" />
      <circle cx="20" cy="47.5" r="3" fill="#ffffff" />
      {/* Biomechanical force vectors (upper & lower arms of K) */}
      <path
        d="M 45 16 L 23 32 L 45 48"
        stroke="url(#kl-nav-vec)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="45"
        cy="16"
        r="3.5"
        fill="#60a5fa"
        stroke="#122024"
        strokeWidth="1.5"
      />
      <circle
        cx="45"
        cy="48"
        r="3.5"
        fill="#34d399"
        stroke="#122024"
        strokeWidth="1.5"
      />
      {/* Central joint fulcrum node */}
      <circle
        cx="22"
        cy="32"
        r="6"
        fill="#0b6a51"
        stroke="#ffffff"
        strokeWidth="2.5"
      />
      <circle cx="22" cy="32" r="2" fill="#ffffff" />
    </svg>
  );
}

function StatusPill({ ok, label }: { ok?: boolean | null; label: string }) {
  const tone =
    ok === true
      ? "bg-cleared-soft text-cleared border-cleared/20"
      : ok === null
        ? "bg-cobalt-soft text-cobalt border-cobalt/20"
        : "bg-caution-soft text-caution border-caution/20";
  const dot =
    ok === true ? "bg-cleared" : ok === null ? "bg-cobalt" : "bg-caution";
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
