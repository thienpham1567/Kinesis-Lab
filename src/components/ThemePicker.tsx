"use client";

import { useEffect, useId, useRef, useState } from "react";
import { isThemeId } from "@/lib/theme";
import { THEMES, useTheme } from "./ThemeProvider";
import { Icon } from "./WorkspaceUI";

function stripes(swatches: readonly string[], direction = "to bottom") {
  const n = swatches.length;
  return `linear-gradient(${direction}, ${swatches
    .map((color, index) => {
      const start = ((index / n) * 100).toFixed(1);
      const end = (((index + 1) / n) * 100).toFixed(1);
      return `${color} ${start}% ${end}%`;
    })
    .join(", ")})`;
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const pickerId = useId();
  const listId = `${pickerId}-list`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const listen = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(listen);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={root}>
      <button
        type="button"
        id={pickerId}
        ref={trigger}
        className="theme-picker-trigger"
        aria-label={`Bảng màu, đang dùng ${current.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        title={current.name}
        style={{ backgroundImage: stripes(current.swatches) }}
        onClick={() => {
          const box = trigger.current?.getBoundingClientRect();
          if (box) {
            setMenuPos({
              top: box.bottom + 8,
              right: window.innerWidth - box.right,
            });
          }
          setOpen((value) => !value);
        }}
      />
      {open && (
        <div
          id={listId}
          role="menu"
          aria-label="Bảng màu"
          className="theme-picker-menu grid grid-cols-3"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          {THEMES.map((item) => {
            const selected = item.id === theme;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={
                  selected
                    ? "theme-picker-option is-selected"
                    : "theme-picker-option"
                }
                onClick={() => {
                  if (isThemeId(item.id)) setTheme(item.id);
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                <span
                  className="theme-picker-swatch"
                  aria-hidden="true"
                  style={{
                    backgroundImage: stripes(item.swatches),
                  }}
                />
                <span className="theme-picker-name">{item.name}</span>
                {selected ? <Icon name="check" className="size-3.5" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
