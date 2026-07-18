"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { safeLocalStorage } from "@/utils/safeStorage";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get initial theme from DOM or localStorage
    const savedTheme = safeLocalStorage.getItem("slate-theme") as Theme | "";
    const initialTheme = savedTheme || "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);

    const frameId = requestAnimationFrame(() => {
      setThemeState(initialTheme);
      setMounted(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    safeLocalStorage.setItem("slate-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme
  }), [theme, setTheme, toggleTheme]);

  // Avoid rendering blank screen or layout shifts on server
  return (
    <ThemeContext.Provider value={contextValue}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
