"use client";

import { useEffect, useId, useRef, useState } from "react";
import { THEMES, useTheme } from "./ThemeProvider";

function conicFrom(swatches: readonly string[]) {
  const n = swatches.length;
  return `conic-gradient(from 160deg, ${swatches
    .map((color, index) => {
      const start = ((index / n) * 360).toFixed(1);
      const end = (((index + 1) / n) * 360).toFixed(1);
      return `${color} ${start}deg ${end}deg`;
    })
    .join(", ")})`;
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="theme-picker-trigger size-9 shrink-0 overflow-hidden rounded-full p-0"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        title={current.name}
        suppressHydrationWarning
        style={{
          backgroundImage: conicFrom(current.swatches),
          width: 36,
          height: 36,
          minWidth: 36,
          minHeight: 36,
          borderRadius: 9999,
          padding: 0,
        }}
        onClick={() => setOpen((value) => !value)}
      >
        <span id={labelId} className="sr-only">
          Bảng màu: {current.name}
        </span>
      </button>
      {open && (
        <div
          className="theme-picker-menu"
          role="listbox"
          aria-label="Chọn bảng màu"
        >
          {THEMES.map((item) => {
            const selected = item.id === theme;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`theme-picker-option ${selected ? "is-selected" : ""}`}
                onClick={() => {
                  setTheme(item.id);
                  setOpen(false);
                }}
              >
                <span
                  className="theme-picker-swatch"
                  aria-hidden="true"
                  style={{ backgroundImage: conicFrom(item.swatches) }}
                />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
