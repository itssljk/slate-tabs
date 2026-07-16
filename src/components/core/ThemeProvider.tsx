"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
    const savedTheme = localStorage.getItem("slate-theme") as Theme | null;
    const initialTheme = savedTheme || "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);

    const frameId = requestAnimationFrame(() => {
      setThemeState(initialTheme);
      setMounted(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("slate-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Avoid rendering blank screen or layout shifts on server
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
