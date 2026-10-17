import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getPublicSettingsApi } from "../api/systemSettingApi";
import {
  ThemeContext,
  SystemSettingsContext,
  DEFAULT_SYSTEM_SETTINGS,
} from "./themeContextObjects";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || localStorage.getItem("admin_theme");
      if (savedTheme) return savedTheme;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme" || e.key === "admin_theme") {
        if (e.newValue && (e.newValue === "light" || e.newValue === "dark")) {
          setThemeState(e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setThemeState(newTheme);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

