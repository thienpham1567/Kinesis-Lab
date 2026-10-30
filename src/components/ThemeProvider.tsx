"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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
  const current = document.documentElement.dataset.theme ?? null;
  if (isThemeId(current)) return current;
  return "tide";
}

const THEME_CHANGE_EVENT = "kinesis-theme-change";

function subscribeToTheme(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    applyTheme(isThemeId(event.newValue) ? event.newValue : "tide");
    onChange();
  };
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerTheme(): ThemeId {
  return "tide";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Hydrate with the server default, then read the theme already applied by THEME_BOOT.
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, getServerTheme);

  const setTheme = useCallback((id: ThemeId) => {
    applyTheme(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEMES };
