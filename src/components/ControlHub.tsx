"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Shield, Eye, Cpu } from "lucide-react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("slate-theme");
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  }
  return "dark";
}

export default function ControlHub() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Settings States
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [minimalLayout, setMinimalLayout] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize states on mount (avoid Next.js hydration mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getInitialTheme());

    const savedGlow = localStorage.getItem("slate-settings-glow") !== "false";
    const savedMinimal = localStorage.getItem("slate-settings-minimal") === "true";
    const savedPerf = localStorage.getItem("slate-settings-perf") === "true";

    setGlowEnabled(savedGlow);
    setMinimalLayout(savedMinimal);
    setPerformanceMode(savedPerf);

    document.documentElement.setAttribute("data-glow", savedGlow ? "true" : "false");
    document.documentElement.setAttribute("data-minimal", savedMinimal ? "true" : "false");
    document.documentElement.setAttribute("data-perf", savedPerf ? "true" : "false");

    setMounted(true);
  }, []);

  // Update theme attributes globally
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("slate-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((open) => !open);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Settings Toggles
  const toggleGlow = (val: boolean) => {
    setGlowEnabled(val);
    localStorage.setItem("slate-settings-glow", val ? "true" : "false");
    document.documentElement.setAttribute("data-glow", val ? "true" : "false");
  };

  const toggleMinimal = (val: boolean) => {
    setMinimalLayout(val);
    localStorage.setItem("slate-settings-minimal", val ? "true" : "false");
    document.documentElement.setAttribute("data-minimal", val ? "true" : "false");
  };

  const togglePerf = (val: boolean) => {
    setPerformanceMode(val);
    localStorage.setItem("slate-settings-perf", val ? "true" : "false");
    document.documentElement.setAttribute("data-perf", val ? "true" : "false");
  };

  // Close on outside click
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDrawerOpen, closeDrawer]);

  // Close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDrawerOpen, closeDrawer]);

  if (!mounted) {
    // Render an invisible placeholder during SSR to prevent layout shifting
    return (
      <div className="fixed top-6 right-6 sm:top-12 sm:right-12 w-[100px] h-[44px] rounded-full opacity-0" />
    );
  }

  const isDark = theme === "dark";

  return (
    <div ref={containerRef} className="fixed top-6 right-6 sm:top-12 sm:right-12 z-50 flex flex-col items-end">
      
      {/* Unified Control Pill */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg backdrop-blur-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--foreground)]/15">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="group relative p-2.5 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              strokeWidth="2.25"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isDark ? "rotate-[40deg]" : "rotate-[90deg]"
              }`}
            >
              {/* Mask to cut out the crescent shape */}
              <mask id="moon-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <circle
                  cx={isDark ? "18" : "30"}
                  cy={isDark ? "6" : "0"}
                  r="8"
                  fill="black"
                  className="transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                />
              </mask>
              
              {/* Main circle (Sun core / Moon body) */}
              <circle
                cx="12"
                cy="12"
                r={isDark ? "8" : "5"}
                fill="currentColor"
                mask="url(#moon-mask)"
                className="transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              />
              
              {/* Solar rays */}
              <g
                className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isDark ? "opacity-0 scale-50 rotate-45" : "opacity-100 scale-100 rotate-0"
                }`}
                style={{ transformOrigin: "center" }}
              >
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </g>
            </svg>
          </div>
        </button>

        {/* Hairline Divider */}
        <div className="w-[1px] h-4.5 bg-[var(--foreground)]/10" />

        {/* Hamburger Menu Toggle Button */}
        <button
          onClick={toggleDrawer}
          className="group relative p-2.5 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:scale-105 active:scale-95 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
        >
          <div className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDrawerOpen ? "rotate-90" : "rotate-0"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path
                d={isDrawerOpen ? "M 5 5 L 19 19" : "M 4 6 L 20 6"}
                className={`origin-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDrawerOpen ? "" : "group-hover:-translate-y-[1px]"
                }`}
              />
              <path
                d={isDrawerOpen ? "M 12 12 L 12 12" : "M 4 12 L 20 12"}
                className={`origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDrawerOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                }`}
              />
              <path
                d={isDrawerOpen ? "M 5 19 L 19 5" : "M 4 18 L 20 18"}
                className={`origin-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDrawerOpen ? "" : "group-hover:translate-y-[1px]"
                }`}
              />
            </svg>
          </div>
        </button>

      </div>

      {/* Settings Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/15 dark:bg-black/45 backdrop-blur-[2px] z-30 transition-all duration-500 ease-in-out ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={closeDrawer}
      />

      {/* Settings Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-[var(--glass-bg)] backdrop-blur-[30px] border-l border-[var(--glass-border)] z-40 p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-95"
        }`}
        style={{ height: "100vh" }}
      >
        <div className="flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mt-2">
            <div className="flex flex-col">
              <h2 className="text-lg font-light tracking-wide text-[var(--foreground)]">Preferences</h2>
              <p className="text-[10px] tracking-wider text-[var(--foreground)]/58 dark:text-[var(--foreground)]/40 uppercase font-medium mt-0.5">
                Customize Slate Tabs
              </p>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/60 dark:text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:rotate-90 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Options (Staggered Entry via Tailwind delay classes) */}
          <div className="flex flex-col gap-5 mt-2">
            
            {/* Glow Toggle */}
            <div
              style={{ animationDelay: "50ms" }}
              className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                isDrawerOpen ? "animate-item-in" : "opacity-0"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--accent)]" /> Ambient Glow
                </span>
                <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                  Soft ambient breathing glow effects
                </span>
              </div>
              <button
                onClick={() => toggleGlow(!glowEnabled)}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  glowEnabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    glowEnabled ? "translate-x-5" : "translate-x-0"
                  } active:scale-x-125`}
                />
              </button>
            </div>

            {/* Minimal Layout */}
            <div
              style={{ animationDelay: "100ms" }}
              className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                isDrawerOpen ? "animate-item-in" : "opacity-0"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--accent)]" /> Minimal Layout
                </span>
                <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                  Hides the footer branding
                </span>
              </div>
              <button
                onClick={() => toggleMinimal(!minimalLayout)}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  minimalLayout ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    minimalLayout ? "translate-x-5" : "translate-x-0"
                  } active:scale-x-125`}
                />
              </button>
            </div>

            {/* Performance Mode */}
            <div
              style={{ animationDelay: "150ms" }}
              className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                isDrawerOpen ? "animate-item-in" : "opacity-0"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--accent)]" /> Low Motion
                </span>
                <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                  Disables complex filters and transition delays
                </span>
              </div>
              <button
                onClick={() => togglePerf(!performanceMode)}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  performanceMode ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    performanceMode ? "translate-x-5" : "translate-x-0"
                  } active:scale-x-125`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] tracking-widest text-[var(--foreground)]/48 dark:text-[var(--foreground)]/30 uppercase font-medium pt-6 border-t border-[var(--glass-border)]/40 mb-2">
          Slate Tabs v0.1.0
        </div>

      </div>

    </div>
  );
}
