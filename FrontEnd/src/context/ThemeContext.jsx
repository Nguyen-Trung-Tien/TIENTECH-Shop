import React, { useState, useEffect, useMemo, useCallback } from "react";

import { ThemeContext } from "./themeContextObjects";

const VALID_THEMES = new Set(["light", "dark", "system"]);

const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
};

const readStoredThemeMode = () => {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem("theme") || localStorage.getItem("admin_theme");
    if (saved && VALID_THEMES.has(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return "system";
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(readStoredThemeMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", resolvedTheme === "dark" ? "#090d16" : "#2563eb");
    }

    try {
      localStorage.setItem("theme", themeMode);
      localStorage.setItem("admin_theme", themeMode);
    } catch {
      // Ignore storage access errors
    }
  }, [themeMode, resolvedTheme]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme" || e.key === "admin_theme") {
        if (e.newValue && VALID_THEMES.has(e.newValue)) {
          setThemeMode(e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const currentResolved = prev === "system" ? getSystemTheme() : prev;
      return currentResolved === "light" ? "dark" : "light";
    });
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (VALID_THEMES.has(newTheme)) {
      setThemeMode(newTheme);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      theme: resolvedTheme,
      themeMode,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      toggleTheme,
      setTheme,
    }),
    [resolvedTheme, themeMode, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

