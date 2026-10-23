"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "structures", label: "Cấu trúc" },
  { id: "knowledge", label: "Kiến thức" },
  { id: "sources", label: "Nguồn" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AtlasLearningInspector({
  overview,
  structures,
  knowledge,
  sources,
  defaultTab = "overview",
}: Record<Tab, ReactNode> & { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(() => defaultTab);
  const [open, setOpen] = useState(true);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next].id);
    buttons.current[next]?.focus();
  }
  const panes = { overview, structures, knowledge, sources };
  return (
    <aside
      className="min-w-0 overflow-hidden rounded-xl border border-rule bg-sheet xl:sticky xl:top-24"
      aria-label="Bàn học giải phẫu"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="eyebrow text-cobalt">Bàn học / Anatomy</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          className="min-h-11 px-2 text-xs font-semibold text-slate underline underline-offset-4"
        >
          {open ? "Thu gọn" : "Mở nội dung"}
        </button>
      </header>
      <div id={`${id}-body`} hidden={!open}>
        <div
          role="tablist"
          aria-label="Nội dung bàn học"
          className="grid grid-cols-4 border-y border-rule bg-canvas"
        >
          {TABS.map((item, index) => (
            <button
              type="button"
              key={item.id}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              id={`${id}-${item.id}`}
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`${id}-${item.id}-panel`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => moveTab(event, index)}
              className={`min-h-12 border-b-2 px-1 text-xs font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cobalt ${tab === item.id ? "border-cobalt bg-sheet text-cobalt" : "border-transparent text-slate"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {TABS.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`${id}-${item.id}-panel`}
            aria-labelledby={`${id}-${item.id}`}
            hidden={tab !== item.id}
            tabIndex={0}
            className="min-w-0 space-y-4 p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cobalt xl:max-h-[70svh] xl:overflow-y-auto xl:overscroll-contain"
          >
            {tab === item.id ? panes[item.id] : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
