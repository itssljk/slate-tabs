"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  domain: string;
}

const ENGINES: SearchEngine[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q=%s", domain: "google.com" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=%s", domain: "bing.com" },
  { id: "yahoo", name: "Yahoo", url: "https://search.yahoo.com/search?p=%s", domain: "yahoo.com" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s", domain: "duckduckgo.com" },
  { id: "brave", name: "Brave Search", url: "https://search.brave.com/search?q=%s", domain: "brave.com" },
  { id: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?q=%s", domain: "startpage.com" },
  { id: "ecosia", name: "Ecosia", url: "https://www.ecosia.org/search?q=%s", domain: "ecosia.org" },
  { id: "yandex", name: "Yandex", url: "https://yandex.com/search/?text=%s", domain: "yandex.com" },
  { id: "baidu", name: "Baidu", url: "https://www.baidu.com/s?wd=%s", domain: "baidu.com" }
];

const FLY_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const STAGGER_MS = 45;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedId, setSelectedId] = useState("google");
  const [faviconError, setFaviconError] = useState(false);

  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [entered, setEntered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number>(0);
  const closingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [orbitCenter, setOrbitCenter] = useState({ x: 0, y: 0 });
  const [orbitRadius, setOrbitRadius] = useState(130);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (phase === "open" && triggerRef.current && containerRef.current && !mobile) {
        const btnRect = triggerRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;
        const PADDING = 24;
        const maxAllowed = 130;
        const constrained = Math.min(
          btnCenterX - PADDING,
          window.innerWidth - btnCenterX - PADDING,
          btnCenterY - PADDING,
          window.innerHeight - btnCenterY - PADDING,
          maxAllowed
        );
        setOrbitCenter({
          x: btnRect.left + btnRect.width / 2 - containerRect.left,
          y: btnRect.top + btnRect.height / 2 - containerRect.top,
        });
        setOrbitRadius(Math.max(constrained, 60));
      } else if (!mobile) {
        setOrbitRadius(130);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [phase]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (closingTimer.current) clearTimeout(closingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "open") {
      rafRef.current = requestAnimationFrame(() => setEntered(true));
    }
    if (phase === "closed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntered(false);
    }
  }, [phase]);

  const [shortcutLabel, setShortcutLabel] = useState("/");

  useEffect(() => {
    if (phase === "closing") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntered(false);
      const totalMs = ENGINES.length * STAGGER_MS + 400;
      closingTimer.current = setTimeout(() => setPhase("closed"), totalMs);
    }
  }, [phase]);

  const activeEngine = ENGINES.find((e) => e.id === selectedId) || ENGINES[0];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFaviconError(false);
  }, [selectedId]);

  const openPicker = useCallback(() => {
    if (!triggerRef.current || !containerRef.current) return;
    const btnRect = triggerRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const PADDING = 24;
    const maxAllowed = window.innerWidth < 640 ? 100 : 130;

    const constrained = Math.min(
      btnCenterX - PADDING,
      window.innerWidth - btnCenterX - PADDING,
      btnCenterY - PADDING,
      window.innerHeight - btnCenterY - PADDING,
      maxAllowed
    );

    setOrbitCenter({
      x: btnRect.left + btnRect.width / 2 - containerRect.left,
      y: btnRect.top + btnRect.height / 2 - containerRect.top,
    });
    setOrbitRadius(Math.max(constrained, 60));
    setPhase("open");
  }, []);

  const closePicker = useCallback(() => {
    if (phase !== "open") return;
    if (closingTimer.current) clearTimeout(closingTimer.current);
    setPhase("closing");
  }, [phase]);

  const togglePicker = useCallback(() => {
    if (phase === "open") closePicker();
    else if (phase === "closed") openPicker();
  }, [phase, openPicker, closePicker]);

  const selectEngine = (id: string) => {
    setSelectedId(id);
    localStorage.setItem("slate-search-engine-id", id);
    closePicker();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedId = localStorage.getItem("slate-search-engine-id");
    if (savedId) {
      // Only restore if it's a valid preset (ignore legacy "custom")
      if (ENGINES.some((e) => e.id === savedId)) {
        setSelectedId(savedId);
      }
    }

    const isMac = typeof window !== "undefined" && 
      (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac"));
    setShortcutLabel(isMac ? "⌘K" : "Ctrl+K");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "open") {
        closePicker();
      }
      
      const isSlash = e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA";
      
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "k";

      if (isSlash || isCmdK) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        phase === "open"
      ) {
        closePicker();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const targetUrl = activeEngine.url.trim();
    let finalUrl = targetUrl.replace("%s", encodeURIComponent(query.trim()));

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    closePicker();
    window.location.href = finalUrl;
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const showOrbit = phase !== "closed";
  const isClosing = phase === "closing";

  return (
    <div ref={containerRef} className="w-full max-w-lg mx-auto flex flex-col gap-4 relative">
      {showOrbit && (
        <div
          className="fixed inset-0 z-30 cursor-default animate-fade-in"
          style={isClosing ? { animationDirection: "reverse", animationFillMode: "forwards" } : undefined}
          onClick={closePicker}
          aria-hidden="true"
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full transition-all duration-300 relative group"
        style={{ zIndex: showOrbit ? 50 : 10 }}
      >
        <div className="relative flex items-center">
          <button
            ref={triggerRef}
            type="button"
            onClick={togglePicker}
            title="Choose Search Engine"
            className={`absolute left-3 p-1.5 rounded-full active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center
              ${showOrbit ? "bg-[var(--accent)]/15 z-50" : "hover:bg-[var(--foreground)]/5 z-20"}`}
          >
            <span
              className={`flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                showOrbit ? "rotate-[20deg] scale-110" : "rotate-0"
              }`}
            >
              {isMounted && activeEngine.domain && !faviconError ? (
                <img
                  src={`https://www.google.com/s2/favicons?sz=64&domain=${activeEngine.domain}`}
                  alt=""
                  className="w-5 h-5 object-contain filter dark:brightness-90 select-none"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Search className="w-4 h-4 text-[var(--foreground)]/55 group-focus-within:text-[var(--accent)] transition-colors" />
              )}
            </span>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={!isMounted ? "Search..." : `Search ${activeEngine.name}...`}
            className="w-full h-[52px] pl-12 pr-12 rounded-full glass-input text-[var(--foreground)] text-base sm:text-sm placeholder-[var(--foreground)]/50 tracking-wide focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {!query && (
            <kbd className="absolute right-4 px-1.5 py-0.5 rounded border border-[var(--foreground)]/25 text-[10px] text-[var(--foreground)]/40 pointer-events-none group-focus-within:opacity-0 transition-opacity duration-200 uppercase font-sans">
              {shortcutLabel}
            </kbd>
          )}

          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-4 p-1 rounded-full text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              query ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* ════════════════════════════════════════════
           ENGINE PICKER
           ════════════════════════════════════════════ */}
      {showOrbit && isMobile && (
        <div
          className={`absolute left-1/2 z-40 ${isClosing ? "animate-orbit-pop-out" : "animate-scale-up"}`}
          style={{ top: "calc(100% + 8px)", translate: "-50% 0" }}
        >
          <div className="flex flex-wrap justify-center gap-2 px-2 max-w-[calc(100vw-2rem)]">
            {ENGINES.map((engine) => {
              const isActive = selectedId === engine.id;
              return (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => selectEngine(engine.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap
                    ${isActive
                      ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]"
                      : "bg-[var(--foreground)]/5 text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10 hover:text-[var(--foreground)]/90"
                    }
                    active:scale-95`}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${engine.domain}`}
                    alt=""
                    className="w-4 h-4 object-contain select-none pointer-events-none"
                  />
                  <span>{engine.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showOrbit && !isMobile && (
        <>
          <div
            className={`absolute rounded-full border border-[var(--accent)]/10 pointer-events-none z-30 ${
              isClosing ? "animate-orbit-ring-out" : "animate-orbit-ring-in"
            }`}
            style={{
              left: orbitCenter.x - orbitRadius,
              top: orbitCenter.y - orbitRadius,
              width: orbitRadius * 2,
              height: orbitRadius * 2,
            }}
          />

          <div className="absolute inset-0 z-30 pointer-events-none" aria-hidden="true">
            {ENGINES.map((engine, i) => {
              const total = ENGINES.length;
              const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
              const ox = Math.cos(angle) * orbitRadius;
              const oy = Math.sin(angle) * orbitRadius;
              const isActive = selectedId === engine.id;
              const stagger = isClosing
                ? (total - 1 - i) * STAGGER_MS
                : i * STAGGER_MS;

              return (
                <div
                  key={engine.id}
                  className="absolute select-none"
                  style={{ left: orbitCenter.x, top: orbitCenter.y, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className="flex flex-col items-center gap-1"
                    style={{
                      translate: entered && !isClosing ? `${ox}px ${oy}px` : "0px 0px",
                      transition: `translate 0.5s ${FLY_EASE}`,
                      transitionDelay: `${stagger}ms`,
                    }}
                  >
                    <div
                      className={`flex flex-col items-center gap-1 ${
                        isClosing ? "animate-orbit-pop-out" : "animate-orbit-pop-in"
                      }`}
                      style={{
                        animationDelay: `${stagger}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => selectEngine(engine.id)}
                        title={engine.name}
                        className={`pointer-events-auto w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer
                          ${isActive
                            ? "bg-[var(--accent)]/15 shadow-[0_0_18px_var(--accent-glow)]"
                            : "hover:bg-[var(--foreground)]/8 hover:scale-[1.15] hover:shadow-[0_0_24px_var(--accent-glow)]"
                          }
                          active:scale-90`}
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?sz=64&domain=${engine.domain}`}
                          alt={engine.name}
                          className="w-4 h-4 sm:w-[18px] sm:h-[18px] object-contain filter dark:brightness-90 select-none pointer-events-none"
                        />
                      </button>

                      <span
                        className={`pointer-events-auto text-[9px] sm:text-[10px] font-medium tracking-tight px-1.5 py-0.5 rounded-full whitespace-nowrap animate-label-in
                          ${isActive ? "text-[var(--accent)] bg-[var(--accent)]/10" : "text-[var(--foreground)]/60 bg-[var(--foreground)]/5"}`}
                        style={{
                          animationDelay: `${stagger + 200}ms`,
                          animationFillMode: "both",
                          opacity: isClosing ? 0 : undefined,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {engine.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
