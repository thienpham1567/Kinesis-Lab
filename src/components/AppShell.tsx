"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ThemePicker } from "./ThemePicker";
import { Icon, type IconName } from "./WorkspaceUI";

const NAV: {
  href: string;
  label: string;
  short: string;
  icon: IconName;
}[] = [
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
          <div className="relative flex min-h-16 w-full items-center gap-2 px-4 py-2 sm:gap-3 sm:px-7 lg:h-16 lg:px-8 lg:py-0">
            <Link
              href="/atlas"
              className="group flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-3 rounded-lg"
              aria-label="Kinesis Lab — Trang chủ"
            >
              <KinesisLogo className="size-9 max-w-none shrink-0 rounded-xl ring-1 ring-white/15 transition-transform duration-150 group-hover:scale-[1.03]" />
              <span className="hidden whitespace-nowrap text-[15px] font-bold tracking-tight text-white xl:inline">
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
                      <span className="hidden whitespace-nowrap xl:inline">
                        {item.label}
                      </span>
                      <span className="whitespace-nowrap xl:hidden">
                        {item.short}
                      </span>
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

            <p className="workspace-current-page flex min-w-0 flex-1 items-center justify-center gap-2 text-center lg:hidden">
              <Icon
                name={current.icon}
                className="hidden size-3.5 shrink-0 text-[var(--mark)] min-[360px]:block"
              />
              <span className="min-w-0 text-[13px] leading-tight font-semibold tracking-tight text-balance text-white">
                {current.label}
              </span>
            </p>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <ThemePicker />
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            data-workspace-scroll
            onScroll={() => window.dispatchEvent(new Event("scroll"))}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
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
      </div>
      <nav className="workspace-mobile-nav" aria-label="Điều hướng di động">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors ${
                active
                  ? "bg-cobalt-soft text-ink"
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
          x1="8"
          y1="4"
          x2="56"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#12242C" />
          <stop offset="1" stopColor="#164A8C" />
        </linearGradient>
        <linearGradient
          id="kl-nav-vec"
          x1="22"
          y1="16"
          x2="47"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7EB8F0" />
          <stop offset="1" stopColor="#3DB89A" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#kl-nav-bg)" />
      <rect
        x="3.2"
        y="3.2"
        width="57.6"
        height="57.6"
        rx="12.8"
        stroke="#F6F1EA"
        strokeOpacity="0.16"
        strokeWidth="1.25"
      />
      <path
        d="M30.4 16.6 A17.4 17.4 0 0 1 30.4 47.4"
        stroke="#8EBFEC"
        strokeOpacity="0.48"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M22 14.6v34.8"
        stroke="#F6F1EA"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M46.6 15.6 22 32 46.6 48.4"
        stroke="url(#kl-nav-vec)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="46.6"
        cy="15.6"
        r="3.15"
        fill="#7EB8F0"
        stroke="#12242C"
        strokeWidth="1.35"
      />
      <circle
        cx="46.6"
        cy="48.4"
        r="3.15"
        fill="#3DB89A"
        stroke="#12242C"
        strokeWidth="1.35"
      />
      <circle
        cx="22"
        cy="32"
        r="6.7"
        fill="#0F6E54"
        stroke="#F6F1EA"
        strokeWidth="2.1"
      />
      <circle cx="22" cy="32" r="2.35" fill="#F6F1EA" />
    </svg>
  );
}
