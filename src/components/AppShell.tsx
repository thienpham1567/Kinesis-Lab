"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { StudyChatWidget } from "./StudyChatWidget";
import { Icon, type IconName } from "./WorkspaceUI";

const NAV: {
  href: string;
  label: string;
  short: string;
  description: string;
  icon: IconName;
}[] = [
  {
    href: "/consult",
    label: "Bàn tư vấn",
    short: "Tư vấn",
    description: "Lâm sàng & vận động",
    icon: "message",
  },
  {
    href: "/atlas",
    label: "Atlas giải phẫu",
    short: "Atlas",
    description: "Cơ, khớp & bài tập",
    icon: "atlas",
  },
  {
    href: "/clients",
    label: "Hồ sơ học viên",
    short: "Học viên",
    description: "Theo dõi & sàng lọc",
    icon: "users",
  },
  {
    href: "/movement",
    label: "Sổ tay vận động",
    short: "Sổ tay",
    description: "4 nền tảng đánh giá",
    icon: "activity",
  },
  {
    href: "/knowledge",
    label: "Giáo trình NCSF",
    short: "NCSF",
    description: "Đọc giáo trình & làm đề",
    icon: "book",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) =>
    path === href || path.startsWith(href + "/");
  const current = NAV.find((item) => isActive(item.href)) ?? NAV[0];

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <div className="workspace-content flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-rule bg-sheet/95 shadow-[0_2px_14px_-4px_rgb(26_45_64/0.05)] backdrop-blur-md">
          <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-5 py-2.5 sm:px-7 lg:px-8">
            <Link
              href="/atlas"
              className="group flex shrink-0 items-center gap-3 pr-2"
              aria-label="Kinesis Lab — Trang chủ"
            >
              <KinesisLogo className="size-10 shrink-0 rounded-[14px] shadow-[0_4px_12px_rgb(13_70_150/0.22)] transition-transform duration-150 group-hover:scale-[1.02]" />
              <div>
                <span className="block whitespace-nowrap text-[15px] font-bold tracking-tight text-ink">
                  Kinesis Lab<span className="text-cobalt">.</span>
                </span>
                <span className="mt-0.5 block whitespace-nowrap font-mono text-[9px] font-medium tracking-[.14em] text-slate">
                  MOVEMENT · SCIENCE
                </span>
              </div>
            </Link>
            <nav
              aria-label="Điều hướng chính"
              className="ml-auto hidden max-w-[1080px] flex-1 grid-cols-5 gap-1.5 rounded-2xl border border-rule bg-surface/80 p-1.5 shadow-[inset_0_1px_2px_rgb(26_45_64/0.04)] lg:grid"
            >
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-150 ${
                      active
                        ? "border-cobalt/25 bg-sheet text-ink shadow-[0_2px_10px_-2px_rgb(36_84_203/0.12)]"
                        : "border-transparent text-slate hover:border-rule/80 hover:bg-sheet/75 hover:text-ink"
                    }`}
                  >
                    <span
                      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        active
                          ? "border-cobalt bg-cobalt text-white shadow-[0_2px_6px_rgb(36_84_203/0.28)]"
                          : "border-rule bg-sheet text-slate group-hover:border-cobalt/25 group-hover:bg-cobalt-soft group-hover:text-cobalt"
                      }`}
                    >
                      <Icon name={item.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold leading-tight">
                        <span className="xl:hidden">{item.short}</span>
                        <span className="hidden xl:inline">{item.label}</span>
                      </span>
                      <span className="mt-0.5 hidden truncate text-[10px] leading-tight text-slate xl:block">
                        {item.description}
                      </span>
                    </span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3.5 -bottom-[1px] h-0.5 rounded-full bg-cobalt"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-main flex-1 outline-none"
        >
          {children}
        </main>
        <footer className="workspace-footer mx-auto w-full max-w-[1600px] px-5 pt-4 text-xs leading-5 text-slate sm:px-7 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-4">
            <span>
              Kinesis Lab <span className="mx-1.5 text-rule-strong">/</span>{" "}
              Giải phẫu · Cơ sinh học · Lâm sàng
            </span>
          </div>
        </footer>
      </div>
      {!isActive("/consult") && (
        <StudyChatWidget pathname={path} pageLabel={current.label} />
      )}
      <nav className="workspace-mobile-nav" aria-label="Điều hướng di động">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-semibold transition-colors ${
                active
                  ? "border-cobalt/20 bg-cobalt-soft text-cobalt"
                  : "border-transparent text-slate hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon name={item.icon} className="size-5" />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </nav>
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
