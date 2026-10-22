"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Icon, type IconName } from "./WorkspaceUI";

const NAV: {
  href: string;
  label: string;
  short: string;
  icon: IconName;
  description: string;
}[] = [
  {
    href: "/",
    label: "Bàn tư vấn",
    short: "Tư vấn",
    icon: "message",
    description: "Lâm sàng & vận động",
  },
  {
    href: "/atlas",
    label: "Atlas giải phẫu",
    short: "Atlas",
    icon: "atlas",
    description: "Cơ, khớp & bài tập",
  },
  {
    href: "/clients",
    label: "Hồ sơ học viên",
    short: "Học viên",
    icon: "users",
    description: "Theo dõi & sàng lọc",
  },
  {
    href: "/movement",
    label: "Sổ tay vận động",
    short: "Sổ tay",
    icon: "activity",
    description: "4 nền tảng đánh giá",
  },
  {
    href: "/knowledge",
    label: "Giáo trình NCSF",
    short: "NCSF",
    icon: "book",
    description: "Đọc giáo trình & làm đề",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
  const current = NAV.find((item) => isActive(item.href)) ?? NAV[0];

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <aside className="workspace-sidebar">
        <Link
          href="/"
          className="flex items-center gap-3 px-6 py-7"
          aria-label="Kinesis Lab — Trang tư vấn"
        >
          <KinesisLogo className="size-10" />
          <div>
            <span className="block text-base font-bold tracking-tight text-ink">
              Kinesis Lab<span className="text-cobalt">.</span>
            </span>
            <span className="mt-0.5 block whitespace-nowrap font-mono text-[8px] tracking-[.08em] text-slate">
              MOVEMENT · SCIENCE
            </span>
          </div>
        </Link>
        <div className="mx-6 border-t border-rule" />
        <p className="px-6 pb-3 pt-7 font-mono text-[9px] font-medium tracking-[.14em] text-slate">
          KHÔNG GIAN LÀM VIỆC
        </p>
        <nav aria-label="Điều hướng chính" className="space-y-2 px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-3.5 transition-colors ${isActive(item.href) ? "border-cobalt/10 bg-cobalt-soft text-cobalt" : "border-transparent text-slate hover:bg-canvas hover:text-ink"}`}
            >
              <Icon name={item.icon} className="size-5" />
              <div>
                <span className="block text-[13px] font-semibold">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[10px] opacity-80">
                  {item.description}
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="workspace-content flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-rule bg-sheet/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-3 px-5 sm:px-7 xl:px-8">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 xl:hidden"
              aria-label="Kinesis Lab — Trang tư vấn"
            >
              <KinesisLogo className="size-9 shrink-0" />
              <span className="whitespace-nowrap text-sm font-bold tracking-tight text-ink">
                Kinesis Lab<span className="text-cobalt">.</span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 text-xs text-slate xl:flex">
              <span>Không gian làm việc</span>
              <span className="text-rule-strong">/</span>
              <span className="font-medium text-ink">{current.label}</span>
              {path.startsWith("/clients/") && (
                <>
                  <span className="text-rule-strong">/</span>
                  <span>Chi tiết hồ sơ</span>
                </>
              )}
            </div>
            <ConnectionStatus />
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-main flex-1 outline-none"
        >
          {children}
        </main>
        <footer className="workspace-footer mx-5 border-t border-rule pt-5 text-xs leading-5 text-slate sm:mx-7 xl:mx-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Kinesis Lab <span className="mx-1.5 text-rule-strong">/</span>{" "}
              Giải phẫu · Cơ sinh học · Lâm sàng
            </span>
            <span>
              Phạm vi PT: sàng lọc vận động, điều chỉnh tải & bài tập — không
              chẩn đoán, không kê đơn.
            </span>
          </div>
        </footer>
      </div>
      <nav className="workspace-mobile-nav" aria-label="Điều hướng di động">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold ${isActive(item.href) ? "bg-cobalt-soft text-cobalt" : "text-slate"}`}
          >
            <Icon name={item.icon} className="size-5" />
            {item.short}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function ConnectionStatus() {
  const [health, setHealth] = useState<{
    openrouter: boolean;
    supabase: boolean;
  } | null>(null);
  const [healthError, setHealthError] = useState(false);
  useEffect(() => {
    let ignore = false;
    fetch("/api/health")
      .then((r) => {
        if (!r.ok) throw new Error("health");
        return r.json();
      })
      .then((data) => {
        if (!ignore) setHealth(data);
      })
      .catch(() => {
        if (!ignore) setHealthError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      aria-live="polite"
    >
      <StatusPill
        tone={
          healthError
            ? "warning"
            : !health
              ? "neutral"
              : health.openrouter
                ? "success"
                : "warning"
        }
        label={
          healthError
            ? "Chưa rõ kết nối"
            : !health
              ? "Kiểm tra kết nối…"
              : health.openrouter
                ? "AI đã kết nối"
                : "AI chưa kết nối"
        }
      />
      {health && (
        <StatusPill
          tone="neutral"
          label={health.supabase ? "Lưu trên Cloud" : "Lưu trên máy"}
        />
      )}
    </div>
  );
}

function KinesisLogo({ className = "size-9" }: { className?: string }) {
  const backgroundId = useId();
  const vectorId = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={backgroundId}
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
          id={vectorId}
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
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill={`url(#${backgroundId})`}
      />
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
        stroke={`url(#${vectorId})`}
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

function StatusPill({
  tone,
  label,
}: {
  tone: "success" | "warning" | "neutral";
  label: string;
}) {
  const colors = {
    success: "text-cleared",
    warning: "text-caution",
    neutral: "text-slate",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-rule bg-sheet px-2 py-1 text-[10px] font-medium sm:text-[11px] ${colors[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
