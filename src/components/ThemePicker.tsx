"use client";

import { useId } from "react";
import { isThemeId } from "@/lib/theme";
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
  const pickerId = useId();
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  return (
    <div className="shrink-0">
      <label htmlFor={pickerId} className="sr-only">
        Bảng màu
      </label>
      <select
        id={pickerId}
        className="theme-picker-trigger"
        title={current.name}
        value={theme}
        style={{
          backgroundImage: conicFrom(current.swatches),
        }}
        onChange={(event) => {
          if (isThemeId(event.target.value)) setTheme(event.target.value);
        }}
      >
        {THEMES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
