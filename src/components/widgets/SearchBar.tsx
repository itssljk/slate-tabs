"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, SlidersHorizontal, Globe, Layers, Check, Settings } from "lucide-react";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  domain: string;
  suggestUrl?: string;
  parseSuggestions?: (data: unknown) => string[];
  jsonpCallbackParam?: string;
}

function parseGoogleSuggest(data: unknown): string[] {
  const arr = data as [string, string[]];
  return arr?.[1] ?? [];
}

function jsonpFetch(url: string, callbackParam: string, timeoutMs = 5000): Promise<unknown> {
  const callbackName = `_slate_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP timeout"));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      (window as unknown as Record<string, unknown>)[callbackName] = () => {};
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}${callbackParam}${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP script error"));
    };
    document.head.appendChild(script);
  });
}

interface SuggestEngine extends SearchEngine {
  suggestUrl: string;
  parseSuggestions: (data: unknown) => string[];
  jsonpCallbackParam?: string;
}

function isSuggestEngine(e: SearchEngine): e is SuggestEngine {
  return !!e.suggestUrl && !!e.parseSuggestions;
}

function loadCustomEngines(): SearchEngine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("slate-custom-engines");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: { id?: string; name?: string; url?: string; domain?: string }) => ({
      id: e.id || `custom-${Date.now()}`,
      name: e.name || "Custom",
      url: e.url || "https://www.google.com/search?q=%s",
      domain: e.domain || "example.com",
    }));
  } catch {
    return [];
  }
}

const ENGINES: SearchEngine[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q=%s", domain: "google.com", suggestUrl: "https://suggestqueries.google.com/complete/search?client=chrome&q=", parseSuggestions: parseGoogleSuggest, jsonpCallbackParam: "&callback=" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=%s", domain: "bing.com" },
  { id: "yahoo", name: "Yahoo", url: "https://search.yahoo.com/search?p=%s", domain: "yahoo.com" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s", domain: "duckduckgo.com" },
  { id: "brave", name: "Brave Search", url: "https://search.brave.com/search?q=%s", domain: "brave.com" },
  { id: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?q=%s", domain: "startpage.com" },
  { id: "ecosia", name: "Ecosia", url: "https://www.ecosia.org/search?q=%s", domain: "ecosia.org" },
  { id: "yandex", name: "Yandex", url: "https://yandex.com/search/?text=%s", domain: "yandex.com" },
  { id: "baidu", name: "Baidu", url: "https://www.baidu.com/s?wd=%s", domain: "baidu.com" }
];

function getEngines(): SearchEngine[] {
  const all = [...ENGINES, ...loadCustomEngines()];
  if (typeof window === "undefined") return all;
  try {
    const saved = localStorage.getItem("slate-disabled-engines");
    if (!saved) return all;
    const disabledIds = JSON.parse(saved);
    if (!Array.isArray(disabledIds)) return all;
    const filtered = all.filter((e) => !disabledIds.includes(e.id));
    return filtered.length > 0 ? filtered : [ENGINES[0]];
  } catch {
    return all;
  }
}

function loadCustomServices(): SearchEngine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("slate-custom-services");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((e: { id?: string; name?: string; url?: string; domain?: string }) => ({
      id: e.id || `custom-service-${Date.now()}`,
      name: e.name || "Custom Service",
      url: e.url || "https://www.google.com/search?q=%s",
      domain: e.domain || "example.com",
    }));
  } catch {
    return [];
  }
}

function getServices(): SearchEngine[] {
  const all = [...SERVICES, ...loadCustomServices()];
  if (typeof window === "undefined") return all;
  try {
    const saved = localStorage.getItem("slate-disabled-services");
    if (!saved) return all;
    const disabledIds = JSON.parse(saved);
    if (!Array.isArray(disabledIds)) return all;
    const filtered = all.filter((e) => !disabledIds.includes(e.id));
    return filtered.length > 0 ? filtered : [SERVICES[0]];
  } catch {
    return all;
  }
}

const SERVICES: SearchEngine[] = [
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/results?search_query=%s",
    domain: "youtube.com",
    suggestUrl: "https://suggestqueries.google.com/complete/search?client=chrome&ds=yt&q=",
    parseSuggestions: parseGoogleSuggest,
    jsonpCallbackParam: "&callback="
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Special:Search?search=%s",
    domain: "wikipedia.org",
    suggestUrl: "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=",
    parseSuggestions: parseGoogleSuggest,
    jsonpCallbackParam: "&callback="
  },
  { id: "github", name: "GitHub", url: "https://github.com/search?q=%s", domain: "github.com" },
  { id: "reddit", name: "Reddit", url: "https://www.reddit.com/search/?q=%s", domain: "reddit.com" },
  { id: "stackoverflow", name: "Stack Overflow", url: "https://stackoverflow.com/search?q=%s", domain: "stackoverflow.com" },
  { id: "translate", name: "Google Translate", url: "https://translate.google.com/?sl=auto&tl=en&text=%s&op=translate", domain: "translate.google.com" }
];

const FLY_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const STAGGER_MS = 45;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [activeMode, setActiveMode] = useState<"web" | "services">("web");
  const [servicesEnabled, setServicesEnabled] = useState(true);
  const [selectedWebId, setSelectedWebId] = useState("google");
  const [selectedServiceId, setSelectedServiceId] = useState("youtube");
  const [faviconError, setFaviconError] = useState(false);

  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [entered, setEntered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number>(0);
  const closingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [orbitCenter, setOrbitCenter] = useState({ x: 0, y: 0 });
  const [orbitRadius, setOrbitRadius] = useState(130);
  const [isMobile, setIsMobile] = useState(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsRef = useRef<string[]>([]);
  const showSuggestionsRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const phaseRef = useRef<"closed" | "open" | "closing">("closed");

  useEffect(() => {
    suggestionsRef.current = suggestions;
    showSuggestionsRef.current = showSuggestions;
    activeIndexRef.current = activeIndex;
    phaseRef.current = phase;
  }, [suggestions, showSuggestions, activeIndex, phase]);

  const currentItems = activeMode === "web" ? getEngines() : getServices();
  const activeEngine = currentItems.find((item) => item.id === (activeMode === "web" ? selectedWebId : selectedServiceId)) || currentItems[0];

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
      const totalMs = currentItems.length * STAGGER_MS + 400;
      closingTimer.current = setTimeout(() => setPhase("closed"), totalMs);
    }
  }, [phase, currentItems.length]);

  useEffect(() => {
    if (!isMounted) return;

    if (query.startsWith("/")) {
      const command = query.slice(1).toLowerCase().trim();
      const commandsList = [
        { name: "/settings", desc: "Open Detailed Settings" },
        ...(servicesEnabled ? [{ name: "/mode", desc: `Switch search mode (currently: ${activeMode === "web" ? "Web" : "Services"})` }] : [])
      ];
      const matches = commandsList.filter(c => c.name.startsWith("/" + command));

      if (matches.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSuggestions(matches.map(c => c.name));
        setActiveIndex(-1);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    if (!activeEngine || !isSuggestEngine(activeEngine)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    suggestTimer.current = setTimeout(async () => {
      try {
        const data = await jsonpFetch(
          `${activeEngine.suggestUrl}${encodeURIComponent(query.trim())}`,
          activeEngine.jsonpCallbackParam || "&callback="
        );
        const parsed = activeEngine.parseSuggestions(data);
        setSuggestions(parsed.slice(0, 8));
        setActiveIndex(-1);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [query, activeEngine, activeMode, isMounted, servicesEnabled]);

  const selectSuggestion = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    setActiveIndex(-1);

    if (text.startsWith("/")) {
      const cmd = text.toLowerCase().trim();
      if (cmd === "/settings") {
        window.location.href = "/settings";
        return;
      }
      if (cmd === "/mode" && servicesEnabled) {
        const newMode = activeMode === "web" ? "services" : "web";
        setActiveMode(newMode);
        localStorage.setItem("slate-search-mode", newMode);
        setQuery("");
        if (phase === "open") {
          setPhase("closing");
        }
        return;
      }
    }

    const targetUrl = activeEngine.url.trim();
    let finalUrl = targetUrl.replace("%s", encodeURIComponent(text.trim()));
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }
    window.location.href = finalUrl;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFaviconError(false);
  }, [activeEngine.id]);

  const openPicker = useCallback(() => {
    if (!triggerRef.current || !containerRef.current) return;
    if (closingTimer.current) clearTimeout(closingTimer.current);
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
    if (activeMode === "web") {
      setSelectedWebId(id);
      localStorage.setItem("slate-search-engine-id", id);
    } else {
      setSelectedServiceId(id);
      localStorage.setItem("slate-search-service-id", id);
    }
    closePicker();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 80) {
      closePicker();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedEnabled = localStorage.getItem("slate-settings-services-enabled") !== "false";
    setServicesEnabled(savedEnabled);
    const savedMode = localStorage.getItem("slate-search-mode");
    if (savedEnabled && (savedMode === "web" || savedMode === "services")) {
      setActiveMode(savedMode);
    } else {
      setActiveMode("web");
    }
    const savedWebId = localStorage.getItem("slate-search-engine-id");
    const engines = getEngines();
    if (savedWebId && engines.some((e) => e.id === savedWebId)) {
      setSelectedWebId(savedWebId);
    } else if (engines.length > 0) {
      setSelectedWebId(engines[0].id);
    }
    const savedServiceId = localStorage.getItem("slate-search-service-id");
    const services = getServices();
    if (savedServiceId && services.some((s) => s.id === savedServiceId)) {
      setSelectedServiceId(savedServiceId);
    } else if (services.length > 0) {
      setSelectedServiceId(services[0].id);
    }

    const isMac = typeof window !== "undefined" && 
      (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac"));
    setShortcutLabel(isMac ? "⌘K" : "Ctrl+K");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (phaseRef.current === "open") {
          if (closingTimer.current) clearTimeout(closingTimer.current);
          setPhase("closing");
          return;
        }
        if (showSuggestionsRef.current) {
          setShowSuggestions(false);
          setActiveIndex(-1);
          return;
        }
      }

      if (showSuggestionsRef.current && suggestionsRef.current.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) => (prev < suggestionsRef.current.length - 1 ? prev + 1 : 0));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestionsRef.current.length - 1));
          return;
        }
        if (e.key === "Enter" && activeIndexRef.current >= 0) {
          e.preventDefault();
          selectSuggestion(suggestionsRef.current[activeIndexRef.current]);
          return;
        }
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
      const target = event.target as Node;
      const isInsideContainer = containerRef.current && containerRef.current.contains(target);
      const isInsideDrawer = drawerRef.current && drawerRef.current.contains(target);

      if (!isInsideContainer && !isInsideDrawer) {
        if (phaseRef.current === "open") {
          if (closingTimer.current) clearTimeout(closingTimer.current);
          setPhase("closing");
        }
        if (showSuggestionsRef.current) {
          setShowSuggestions(false);
          setActiveIndex(-1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    const handleEngineUpdate = () => {
      const engineId = localStorage.getItem("slate-search-engine-id");
      const engines = getEngines();
      if (engineId && engines.some((e) => e.id === engineId)) {
        setSelectedWebId(engineId);
      } else if (engines.length > 0) {
        setSelectedWebId(engines[0].id);
      }
    };
    window.addEventListener("slate-search-engine-updated", handleEngineUpdate);

    const handleServicesSettingsUpdate = () => {
      const val = localStorage.getItem("slate-settings-services-enabled") !== "false";
      setServicesEnabled(val);
      if (!val) {
        setActiveMode("web");
        localStorage.setItem("slate-search-mode", "web");
      }
    };
    window.addEventListener("slate-services-settings-updated", handleServicesSettingsUpdate);

    const handleServicesUpdate = () => {
      const serviceId = localStorage.getItem("slate-search-service-id");
      const services = getServices();
      if (serviceId && services.some((s) => s.id === serviceId)) {
        setSelectedServiceId(serviceId);
      } else if (services.length > 0) {
        setSelectedServiceId(services[0].id);
      }
    };
    window.addEventListener("slate-services-updated", handleServicesUpdate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("slate-search-engine-updated", handleEngineUpdate);
      window.removeEventListener("slate-services-settings-updated", handleServicesSettingsUpdate);
      window.removeEventListener("slate-services-updated", handleServicesUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const lowerVal = val.toLowerCase();

    // Trigger /mode space command
    if (lowerVal === "/mode " && servicesEnabled) {
      const newMode = activeMode === "web" ? "services" : "web";
      setActiveMode(newMode);
      localStorage.setItem("slate-search-mode", newMode);
      setQuery("");
      if (phase === "open") {
        setPhase("closing");
      }
      return;
    }

    setQuery(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (query.trim().startsWith("/")) {
      const cmd = query.trim().toLowerCase();
      if (cmd === "/settings") {
        closePicker();
        setShowSuggestions(false);
        setActiveIndex(-1);
        window.location.href = "/settings";
        return;
      }
      if (cmd === "/mode" && servicesEnabled) {
        const newMode = activeMode === "web" ? "services" : "web";
        setActiveMode(newMode);
        localStorage.setItem("slate-search-mode", newMode);
        setQuery("");
        closePicker();
        setShowSuggestions(false);
        setActiveIndex(-1);
        return;
      }
    }

    const targetUrl = activeEngine.url.trim();
    let finalUrl = targetUrl.replace("%s", encodeURIComponent(query.trim()));

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    closePicker();
    setShowSuggestions(false);
    setActiveIndex(-1);
    window.location.href = finalUrl;
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const showOrbit = phase !== "closed";
  const isClosing = phase === "closing";

  return (
    <div
      className="w-full max-w-lg mx-auto flex flex-col gap-4 relative"
      style={{ zIndex: showSuggestions && suggestions.length > 0 && !showOrbit ? 20 : undefined }}
    >
      {showOrbit && (
        <div
          className="fixed inset-0 z-30 cursor-default bg-black/15 dark:bg-black/40 backdrop-blur-[3px] animate-fade-in"
          style={isClosing ? { animationDirection: "reverse", animationFillMode: "forwards" } : undefined}
          onClick={closePicker}
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className="w-full flex flex-col gap-4 relative animate-fade-in-up"
        style={{ zIndex: showOrbit ? 40 : undefined }}
      >

      {/* Mode Switcher Tabs */}
      {isMounted && servicesEnabled && (
        <div 
          className="flex justify-center transition-all duration-300"
          style={{ zIndex: showOrbit ? 50 : 10 }}
        >
          <div className="inline-flex p-0.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md relative select-none">
            {/* Sliding Highlight Background */}
            <div 
              className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_2px_8px_var(--accent-glow)]"
              style={{
                left: activeMode === "web" ? "2px" : "calc(50% + 2px)",
                width: "calc(50% - 4px)"
              }}
            />
            
            <button
              type="button"
              onClick={() => {
                setActiveMode("web");
                localStorage.setItem("slate-search-mode", "web");
                inputRef.current?.focus();
              }}
              className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer relative z-10 w-28 sm:w-32 ${
                activeMode === "web"
                  ? "text-[var(--background)]"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/95"
              }`}
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Web Search</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setActiveMode("services");
                localStorage.setItem("slate-search-mode", "services");
                inputRef.current?.focus();
              }}
              className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer relative z-10 w-28 sm:w-32 ${
                activeMode === "services"
                  ? "text-[var(--background)]"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/95"
              }`}
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Services</span>
            </button>
          </div>
        </div>
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
            title={activeMode === "web" ? "Choose Search Engine" : "Choose Service"}
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
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowSuggestions(false);
                setActiveIndex(-1);
              }, 150);
            }}
            placeholder={!isMounted ? "Search..." : `Search ${activeEngine.name}...`}
            className={`w-full h-[52px] pl-12 pr-12 rounded-full glass-input text-[var(--foreground)] text-base sm:text-sm placeholder-[var(--foreground)]/50 tracking-wide focus:outline-none transition-all duration-300
              ${activeMode === "services" ? "glass-input-services" : ""}`}
            autoComplete="off"
            spellCheck="false"
          />

          {!query && (
            <kbd className="hidden sm:inline-block absolute right-4 px-1.5 py-0.5 rounded border border-[var(--foreground)]/25 text-[10px] text-[var(--foreground)]/40 pointer-events-none group-focus-within:opacity-0 transition-opacity duration-200 uppercase font-sans">
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

      {showSuggestions && suggestions.length > 0 && !showOrbit && (
        <div
          className="absolute left-0 right-0 z-40 animate-suggest-in"
          style={{ top: "calc(100% + 6px)" }}
        >
          <div className="rounded-2xl glass-dropdown overflow-hidden py-1 px-1">
            {suggestions.map((s, i) => {
              const isActive = i === activeIndex;
              const isCommand = s.startsWith("/");
              return (
                <button
                  key={`${s}-${i}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 cursor-pointer
                    ${isActive
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/90"
                    }`}
                >
                  {isCommand ? (
                    <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
                  ) : (
                    <Search className="w-3.5 h-3.5 shrink-0 text-[var(--foreground)]/30" />
                  )}
                  <div className="flex flex-col">
                    <span className="truncate font-medium">{s}</span>
                    {isCommand && (
                      <span className="text-[10px] text-[var(--foreground)]/45 font-normal">
                        {s === "/settings" && "Open Detailed Settings"}
                        {s === "/mode" && `Switch search mode (currently: ${activeMode === "web" ? "Web" : "Services"})`}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
           ENGINE PICKER
           ════════════════════════════════════════════ */}
      {showOrbit && isMobile && isMounted && createPortal(
        <div
          ref={drawerRef}
          className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--glass-bg-dropdown)] border-t border-[var(--glass-border)] rounded-t-[32px] shadow-2xl backdrop-blur-3xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isClosing ? "translate-y-full" : "translate-y-0"
          }`}
          style={{
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
            transform: isClosing ? undefined : `translateY(${dragOffset}px)`,
            transition: isDragging
              ? "none"
              : isClosing
                ? "transform 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)"
                : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Grab Handle */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-12 h-1.5 rounded-full bg-[var(--foreground)]/10 mx-auto my-3 shrink-0 cursor-grab active:cursor-grabbing hover:bg-[var(--foreground)]/20 active:scale-95 transition-all"
          />

          {/* Header */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="px-5 pb-3 pt-1 flex items-center justify-between border-b border-[var(--glass-border)]/40 shrink-0 select-none"
          >
            <div className="flex flex-col">
              <h3 className="text-base font-semibold tracking-wide text-[var(--foreground)]">
                {activeMode === "web" ? "Search Engine" : "Service Engine"}
              </h3>
              <span className="text-[10px] text-[var(--foreground)]/45 uppercase tracking-wider font-medium">
                {activeMode === "web" ? "Web Search Mode" : "Services Mode"}
              </span>
            </div>
            <button
              type="button"
              onClick={closePicker}
              className="p-2 rounded-full bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-5 py-4 flex-1 scrollbar-thin">
            {servicesEnabled && (
              <div className="flex justify-center mb-5">
                <div className="inline-flex p-0.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-md relative select-none w-full max-w-[280px]">
                  {/* Sliding Highlight Background */}
                  <div
                    className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--accent)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_2px_8px_var(--accent-glow)]"
                    style={{
                      left: activeMode === "web" ? "2px" : "calc(50% + 2px)",
                      width: "calc(50% - 4px)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("web");
                      localStorage.setItem("slate-search-mode", "web");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 relative z-10 cursor-pointer ${
                      activeMode === "web" ? "text-[var(--background)]" : "text-[var(--foreground)]/60"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode("services");
                      localStorage.setItem("slate-search-mode", "services");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 relative z-10 cursor-pointer ${
                      activeMode === "services" ? "text-[var(--background)]" : "text-[var(--foreground)]/60"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Services</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pb-4">
              {currentItems.map((engine, idx) => {
                const isActive = (activeMode === "web" ? selectedWebId : selectedServiceId) === engine.id;
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => selectEngine(engine.id)}
                    className={`group flex flex-col items-start gap-2.5 p-3 rounded-2xl border text-left transition-all duration-300 ease-out cursor-pointer relative overflow-hidden active:scale-[0.97]
                      ${
                        isActive
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]/45 text-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]"
                          : "bg-[var(--foreground)]/[0.03] border-[var(--glass-border)]/50 text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/[0.06] hover:text-[var(--foreground)]"
                      }`}
                    style={{
                      animation: "item-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                      animationDelay: `${idx * 40}ms`,
                    }}
                  >
                    {isActive && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-md animate-scale-up">
                        <Check className="w-2.5 h-2.5 text-[var(--background)] stroke-[3]" />
                      </div>
                    )}

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                        isActive ? "bg-[var(--accent)]/15" : "bg-[var(--foreground)]/5"
                      }`}
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${engine.domain}`}
                        alt=""
                        className="w-5 h-5 object-contain select-none pointer-events-none filter dark:brightness-95"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>

                    <div className="flex flex-col min-w-0 w-full">
                      <span className="text-sm font-semibold truncate leading-tight group-hover:translate-x-0.5 transition-transform duration-200">
                        {engine.name}
                      </span>
                      <span
                        className={`text-[10px] truncate mt-0.5 ${
                          isActive ? "text-[var(--accent)]/70" : "text-[var(--foreground)]/40"
                        }`}
                      >
                        {engine.domain}
                      </span>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  closePicker();
                  window.location.href = "/settings";
                }}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-[var(--glass-border)]/80 text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]/80 transition-all duration-300 cursor-pointer active:scale-95 text-center min-h-[92px]"
                style={{
                  animation: "item-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                  animationDelay: `${currentItems.length * 40}ms`,
                }}
              >
                <Settings className="w-5 h-5 opacity-70" />
                <span className="text-xs font-medium">Manage Engines</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showOrbit && !isMobile && (
        <>
          <div
            className={`absolute rounded-full border border-[var(--accent)]/10 pointer-events-none z-40 ${
              isClosing ? "animate-orbit-ring-out" : "animate-orbit-ring-in"
            }`}
            style={{
              left: orbitCenter.x - orbitRadius,
              top: orbitCenter.y - orbitRadius,
              width: orbitRadius * 2,
              height: orbitRadius * 2,
            }}
          />

          <div className="absolute inset-0 z-40 pointer-events-none" aria-hidden="true">
            {currentItems.map((engine, i) => {
              const total = currentItems.length;
              const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
              const ox = Math.cos(angle) * orbitRadius;
              const oy = Math.sin(angle) * orbitRadius;
              const isActive = (activeMode === "web" ? selectedWebId : selectedServiceId) === engine.id;
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
    </div>
  );
}
