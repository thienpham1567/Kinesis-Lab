import type { ReactNode } from "react";

export type IconName =
  | "copy"
  | "bookmark"
  | "message"
  | "atlas"
  | "users"
  | "book"
  | "arrow-right"
  | "arrow-left"
  | "plus"
  | "search"
  | "shield"
  | "check"
  | "alert"
  | "chevron-down"
  | "upload"
  | "file"
  | "close"
  | "refresh"
  | "send"
  | "activity"
  | "external"
  | "spinner"
  | "target"
  | "clock"
  | "expand"
  | "spark";

const paths: Record<IconName, ReactNode> = {
  copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>,
  bookmark: <path d="M5 3h14v18l-7-4-7 4V3Z" />,
  message: (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  atlas: (
    <>
      <path d="M12 3v18M3 6l5-3 8 3 5-3v15l-5 3-8-3-5 3V6ZM8 3v15M16 6v15" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
  book: (
    <>
      <path d="M12 7v14M3 3h4a5 5 0 0 1 5 3 5 5 0 0 1 5-3h4v16h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3V3Z" />
    </>
  ),
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M20 12H4m6-6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  alert: (
    <>
      <path d="m10.3 4.2-8 14A1.8 1.8 0 0 0 3.9 21h16.2a1.8 1.8 0 0 0 1.6-2.8l-8-14a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 12h8M8 16h5" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.1 7a7 7 0 0 1 11.6-1.3L20 9M4 15l2.3 3.3A7 7 0 0 0 17.9 17" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" />
    </>
  ),
  activity: <path d="M2 12h5l3-9 4 18 3-9h5" />,
  external: (
    <>
      <path d="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7" />
    </>
  ),
  spinner: <path d="M21 12a9 9 0 1 1-9-9" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  expand: (
    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
  ),
  spark: (
    <path d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Z" />
  ),
};

export function Icon({
  name,
  className = "size-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading border-b border-rule pb-5">
      <div className="min-w-0">
        <p className="eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-cobalt ring-4 ring-cobalt-soft"
          />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function SectionHeading({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-sm font-semibold text-ink">
        <span className="section-number">{number}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <div className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate">
        {children}
      </div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
