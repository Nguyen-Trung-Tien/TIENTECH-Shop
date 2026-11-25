import { useContext } from "react";
import { ThemeContext } from "./themeContextObjects";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useOptionalTheme = () => {
  const context = useContext(ThemeContext);
  if (context) return context;
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  return {
    theme: isDark ? "dark" : "light",
    themeMode: isDark ? "dark" : "light",
    resolvedTheme: isDark ? "dark" : "light",
    isDark,
    toggleTheme: () => {},
    setTheme: () => {},
  };
};

export default useTheme;
