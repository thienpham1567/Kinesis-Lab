"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { StudyChatWidget } from "./StudyChatWidget";
import { ThemePicker } from "./ThemePicker";
import { Icon, type IconName } from "./WorkspaceUI";

const NAV: {
  href: string;
  label: string;
  short: string;
  icon: IconName;
}[] = [
  {
    href: "/consult",
    label: "Bàn tư vấn",
    short: "Tư vấn",
    icon: "message",
  },
  {
    href: "/atlas",
    label: "Atlas giải phẫu",
    short: "Atlas",
    icon: "atlas",
  },
  {
    href: "/clients",
    label: "Hồ sơ học viên",
    short: "Học viên",
    icon: "users",
  },
  {
    href: "/movement",
    label: "Sổ tay vận động",
    short: "Sổ tay",
    icon: "activity",
  },
  {
    href: "/knowledge",
    label: "Giáo trình NCSF",
    short: "NCSF",
    icon: "book",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isActive = (href: string) =>
    path === href || path.startsWith(href + "/");
  const current = NAV.find((item) => isActive(item.href)) ?? NAV[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [path]);

  return (
    <div className="h-dvh overflow-hidden bg-canvas">
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <div className="workspace-content flex h-dvh flex-col overflow-hidden">
        <header className="workspace-toolbar z-30 shrink-0">
          <div className="relative flex h-16 w-full items-center gap-3 px-5 sm:px-7 lg:px-8">
            <Link
              href="/atlas"
              className="group flex shrink-0 items-center gap-3 rounded-lg"
              aria-label="Kinesis Lab — Trang chủ"
            >
              <KinesisLogo className="size-9 max-w-none shrink-0 rounded-xl ring-1 ring-white/15 transition-transform duration-150 group-hover:scale-[1.03]" />
              <span className="hidden whitespace-nowrap text-[15px] font-bold tracking-tight text-white lg:inline">
                Kinesis Lab<span className="text-[var(--mark)]">.</span>
              </span>
            </Link>

            <nav
              aria-label="Điều hướng chính"
              className="hidden h-full min-w-0 flex-1 items-stretch justify-center overflow-hidden lg:flex"
            >
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative inline-flex min-w-0 items-center px-1.5 text-[13px] font-semibold transition-colors xl:px-2 ${
                      active
                        ? "text-white"
                        : "text-[var(--toolbar-muted)] hover:text-white"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors xl:gap-2.5 xl:px-3 ${
                        active
                          ? "bg-white/[0.1] shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]"
                          : "group-hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        className={`size-4 shrink-0 transition-colors ${
                          active
                            ? "text-[var(--mark)]"
                            : "text-[var(--toolbar-muted)] group-hover:text-white"
                        }`}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-0 h-[2px] rounded-t-full bg-gradient-to-r from-[var(--mark)] to-[var(--cleared)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="pointer-events-none absolute inset-x-16 top-1/2 flex -translate-y-1/2 items-center justify-center gap-2 lg:hidden">
              <Icon name={current.icon} className="size-3.5 text-[var(--mark)]" />
              <span className="truncate text-[13px] font-semibold tracking-tight text-white">
                {current.label}
              </span>
            </p>

            <div className="ml-auto flex shrink-0 items-center">
              <ThemePicker />
            </div>
          </div>
        </header>
        <div
          ref={scrollRef}
          onScroll={() => window.dispatchEvent(new Event("scroll"))}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
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
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${
                active
                  ? "bg-cobalt-soft text-cobalt"
                  : "text-slate hover:bg-surface hover:text-ink"
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
          <stop offset="0" stopColor="var(--p1)" />
          <stop offset="1" stopColor="var(--p3)" />
        </linearGradient>
        <linearGradient
          id={vectorId}
          x1="20"
          y1="14"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--p6)" />
          <stop offset="1" stopColor="var(--p4)" />
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
      <path
        d="M 38 20 A 16 16 0 0 1 38 44"
        stroke="var(--p6)"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
      />
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
        fill="var(--p6)"
        stroke="var(--p1)"
        strokeWidth="1.5"
      />
      <circle
        cx="45"
        cy="48"
        r="3.5"
        fill="var(--p4)"
        stroke="var(--p1)"
        strokeWidth="1.5"
      />
      <circle
        cx="22"
        cy="32"
        r="6"
        fill="var(--p5)"
        stroke="#ffffff"
        strokeWidth="2.5"
      />
      <circle cx="22" cy="32" r="2" fill="#ffffff" />
    </svg>
  );
}
