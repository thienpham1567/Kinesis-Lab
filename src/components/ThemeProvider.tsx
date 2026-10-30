"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  THEMES,
  isThemeId,
  type ThemeId,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "tide",
  setTheme: () => {},
});

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
}

function readTheme(): ThemeId {
  if (typeof document === "undefined") return "tide";
  const current = document.documentElement.dataset.theme;
  if (isThemeId(current ?? null)) return current;
  return "tide";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const next = isThemeId(stored) ? stored : "tide";
    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEMES };
