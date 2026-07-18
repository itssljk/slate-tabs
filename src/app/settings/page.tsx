"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Eye, Cpu, User, Palette,
  Image as ImageIcon, Upload, Link as LinkIcon,
  Sparkles, Trash2, Loader2, Check, Globe, Moon, Sun, CloudSun,
  LayoutGrid, Plus, ArrowUp, ArrowDown, Pencil, X, Layers, Thermometer, Mail,
  MessageSquare
} from "lucide-react";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import { saveBackgroundBlob, clearBackgroundBlob, getBackgroundBlob, DEFAULT_BG_SETTINGS } from "@/utils/backgroundDb";
import { ACCENT_PRESETS, getLightAccentColor, hexToHsl, hslToHex } from "@/utils/accent";
import { CURATED_BACKGROUNDS } from "@/utils/backgrounds";
import { DEFAULT_QUICKLINKS, getDomain, type Quicklink } from "@/utils/quicklinks";
import { siteConfig } from "@/config/site";
import { safeLocalStorage as localStorage } from "@/utils/safeStorage";

const ENGINES = [
  { id: "google", name: "Google", domain: "google.com" },
  { id: "bing", name: "Bing", domain: "bing.com" },
  { id: "yahoo", name: "Yahoo", domain: "yahoo.com" },
  { id: "duckduckgo", name: "DuckDuckGo", domain: "duckduckgo.com" },
  { id: "brave", name: "Brave Search", domain: "brave.com" },
  { id: "startpage", name: "Startpage", domain: "startpage.com" },
  { id: "ecosia", name: "Ecosia", domain: "ecosia.org" },
  { id: "yandex", name: "Yandex", domain: "yandex.com" },
  { id: "baidu", name: "Baidu", domain: "baidu.com" }
];

const SERVICES_PRESETS = [
  { id: "youtube", name: "YouTube", domain: "youtube.com", url: "https://www.youtube.com/results?search_query=%s", defaultEnabled: true },
  { id: "wikipedia", name: "Wikipedia", domain: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Special:Search?search=%s", defaultEnabled: true },
  { id: "github", name: "GitHub", domain: "github.com", url: "https://github.com/search?q=%s", defaultEnabled: true },
  { id: "reddit", name: "Reddit", domain: "reddit.com", url: "https://www.reddit.com/search/?q=%s", defaultEnabled: true },
  { id: "maps", name: "Google Maps", domain: "google.com/maps", url: "https://www.google.com/maps/search/%s", defaultEnabled: true },
  { id: "amazon", name: "Amazon", domain: "amazon.com", url: "https://www.amazon.com/s?k=%s", defaultEnabled: true },
  { id: "stackoverflow", name: "Stack Overflow", domain: "stackoverflow.com", url: "https://stackoverflow.com/search?q=%s", defaultEnabled: false },
  { id: "hackernews", name: "Hacker News", domain: "news.ycombinator.com", url: "https://hn.algolia.com/?q=%s", defaultEnabled: false },
  { id: "spotify", name: "Spotify", domain: "spotify.com", url: "https://open.spotify.com/search/%s", defaultEnabled: false },
  { id: "x", name: "X (Twitter)", domain: "x.com", url: "https://x.com/search?q=%s", defaultEnabled: false }
];


type Tab = "general" | "appearance" | "background" | "search" | "quicklinks" | "support";

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function SettingsFavicon({ domain, title }: { domain: string; title: string }) {
  const [error, setError] = useState(false);
  if (error || !domain) {
    return (
      <span className="text-xs font-semibold text-[var(--accent)] select-none">
        {title.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt=""
      onError={() => setError(true)}
      className="w-4 h-4 object-contain filter dark:brightness-95"
    />
  );
}

function CustomPickerPanel({
  initialHsl,
  initialColor,
  theme,
  onColorChange
}: {
  initialHsl: { h: number; s: number; l: number };
  initialColor: string;
  theme: string;
  onColorChange: (hex: string, hsl: { h: number; s: number; l: number }) => void;
}) {
  const [hsl, setHsl] = useState(initialHsl);
  const [hex, setHex] = useState(initialColor);
  const [hexInput, setHexInput] = useState(initialColor);
  const [hexError, setHexError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHsl(initialHsl);
    setHex(initialColor);
    setHexInput(initialColor);
  }, [initialHsl, initialColor]);

  const updateHsl = (key: "h" | "s" | "l", val: number) => {
    const nextHsl = { ...hsl, [key]: val };
    setHsl(nextHsl);
    const darkHex = hslToHex(nextHsl.h, nextHsl.s, nextHsl.l);
    setHex(darkHex);
    setHexInput(darkHex);

    const lightColor = getLightAccentColor(darkHex);
    document.documentElement.style.setProperty('--custom-accent', darkHex);
    document.documentElement.style.setProperty('--custom-accent-light', lightColor);
    document.documentElement.setAttribute("data-accent", "custom");
  };

  const handleDragEnd = () => {
    onColorChange(hex, hsl);
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    setHexError(false);
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHex = hexInput.trim().replace(/^#+/, "");
    if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      const fullHex = `#${cleanHex}`;
      const parsedHsl = hexToHsl(fullHex);
      setHsl(parsedHsl);
      setHex(fullHex);
      
      const lightColor = getLightAccentColor(fullHex);
      document.documentElement.style.setProperty('--custom-accent', fullHex);
      document.documentElement.style.setProperty('--custom-accent-light', lightColor);
      document.documentElement.setAttribute("data-accent", "custom");
      onColorChange(fullHex, parsedHsl);
    } else {
      setHexError(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-5 rounded-xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 max-w-2xl mt-1 animate-suggest-in">
      <div className="flex-1 flex flex-col gap-4">
        {/* Hue */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-[var(--foreground)]/80">
            <span>Hue</span>
            <span>{hsl.h}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onInput={(e) => updateHsl("h", parseInt((e.target as HTMLInputElement).value))}
            onChange={handleDragEnd}
            className="color-picker-slider w-full h-2 rounded-lg cursor-pointer"
            style={{
              background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
            }}
          />
        </div>

        {/* Saturation */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-[var(--foreground)]/80">
            <span>Saturation</span>
            <span>{hsl.s}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onInput={(e) => updateHsl("s", parseInt((e.target as HTMLInputElement).value))}
            onChange={handleDragEnd}
            className="color-picker-slider w-full h-2 rounded-lg cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
            }}
          />
        </div>

        {/* Lightness */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-[var(--foreground)]/80">
            <span>Lightness</span>
            <span>{hsl.l}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={hsl.l}
            onInput={(e) => updateHsl("l", parseInt((e.target as HTMLInputElement).value))}
            onChange={handleDragEnd}
            className="color-picker-slider w-full h-2 rounded-lg cursor-pointer"
            style={{
              background: `linear-gradient(to right, #000000, hsl(${hsl.h}, ${hsl.s}%, 50%), #ffffff)`,
            }}
          />
        </div>
      </div>

      {/* Hex Text Field and Live Indicator */}
      <div className="w-full md:w-[180px] shrink-0 flex flex-col gap-3 justify-center items-center md:border-l md:border-[var(--glass-border)]/40 md:pl-6">
        <div
          className="w-16 h-16 rounded-2xl border border-[var(--foreground)]/10 shadow-inner flex items-center justify-center text-xs font-mono font-bold tracking-tight select-all cursor-pointer"
          style={{
            backgroundColor: theme === "light" ? getLightAccentColor(hex) : hex,
            color: hsl.l > 60 && theme === "light" ? "#1e2330" : "#ffffff"
          }}
        >
          Color
        </div>
        <div className="flex flex-col gap-1 w-full text-center">
          <label className="text-[10px] font-semibold tracking-wider text-[var(--foreground)]/50 uppercase">Hex Color Value</label>
          <form onSubmit={handleHexSubmit} className="flex gap-1.5 justify-center mt-1">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className={`w-20 text-center text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--foreground)]/5 border transition-all duration-300 ${
                hexError ? "border-rose-500/50" : "border-[var(--glass-border)]"
              }`}
            />
            <button
              type="submit"
              className="px-2 py-1 bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 text-xs font-semibold rounded-lg hover:shadow-[0_0_8px_var(--accent-glow)] transition-all duration-300 cursor-pointer active:scale-95"
            >
              OK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [copied, setCopied] = useState(false);
  const handleCopyInvite = () => {
    navigator.clipboard.writeText("https://discord.gg/Kfn4V2nF3N");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("slate-theme") || "dark") as "dark" | "light";
  });

  // General States
  const [glowEnabled, setGlowEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-glow") !== "false";
  });
  const [performanceMode, setPerformanceMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("slate-settings-perf") === "true";
  });
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("slate-username") || "";
  });
  const [showWeather, setShowWeather] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-weather") !== "false";
  });
  const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">(() => {
    if (typeof window === "undefined") return "celsius";
    return (localStorage.getItem("slate-temp-unit") || "celsius") as "celsius" | "fahrenheit";
  });

  const [showMailButton, setShowMailButton] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-show-mail") !== "false";
  });
  const [mailService, setMailService] = useState<"gmail" | "outlook" | "yahoo" | "custom">(() => {
    if (typeof window === "undefined") return "gmail";
    return (localStorage.getItem("slate-mail-service") || "gmail") as "gmail" | "outlook" | "yahoo" | "custom";
  });
  const [customMailUrl, setCustomMailUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("slate-custom-mail-url") || "";
  });
 
  // Quicklinks States
  const [showQuicklinks, setShowQuicklinks] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-quicklinks") !== "false";
  });
  const [showLabels, setShowLabels] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-quicklinks-labels") !== "false";
  });
  const [showAddButton, setShowAddButton] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-quicklinks-add-button") !== "false";
  });
  const [quicklinks, setQuicklinks] = useState<Quicklink[]>(() => {
    if (typeof window === "undefined") return [];
    const savedLinks = localStorage.getItem("slate-quicklinks");
    if (savedLinks) {
      try {
        return JSON.parse(savedLinks);
      } catch {
        return DEFAULT_QUICKLINKS;
      }
    }
    return DEFAULT_QUICKLINKS;
  });
 
  // Quicklinks Edit Form States
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkNameInput, setLinkNameInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");

  // Appearance States
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window === "undefined") return "sage";
    return localStorage.getItem("slate-accent") || "sage";
  });
  const [customColor, setCustomColor] = useState(() => {
    if (typeof window === "undefined") return "#7ca38e";
    return localStorage.getItem("slate-custom-accent") || "#7ca38e";
  });
  const [customHsl, setCustomHsl] = useState(() => {
    if (typeof window === "undefined") return { h: 147, s: 18, l: 56 };
    const savedCustom = localStorage.getItem("slate-custom-accent") || "#7ca38e";
    return hexToHsl(savedCustom);
  });

  // Background States
  const [bgType, setBgType] = useState<"default" | "curated" | "upload" | "url">(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.type;
    return (localStorage.getItem("slate-bg-type") || DEFAULT_BG_SETTINGS.type) as typeof DEFAULT_BG_SETTINGS.type;
  });
  const [bgCuratedUrl, setBgCuratedUrl] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.curatedUrl;
    return localStorage.getItem("slate-bg-curated-url") || DEFAULT_BG_SETTINGS.curatedUrl;
  });
  const [bgUrlLink, setBgUrlLink] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.urlLink;
    return localStorage.getItem("slate-bg-url-link") || DEFAULT_BG_SETTINGS.urlLink;
  });
  const [bgOpacity, setBgOpacity] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.opacity;
    const saved = localStorage.getItem("slate-bg-opacity");
    return saved ? parseInt(saved) : DEFAULT_BG_SETTINGS.opacity;
  });
  const [bgBlur, setBgBlur] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.blur;
    const saved = localStorage.getItem("slate-bg-blur");
    return saved ? parseInt(saved) : DEFAULT_BG_SETTINGS.blur;
  });
  const [bgDim, setBgDim] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_BG_SETTINGS.dim;
    const saved = localStorage.getItem("slate-bg-dim");
    return saved ? parseInt(saved) : DEFAULT_BG_SETTINGS.dim;
  });
  const [hasUpload, setHasUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);


  // Picsum web gallery states
  const [picsumSubTab, setPicsumSubTab] = useState<"presets" | "gallery">("presets");
  const [picsumPage, setPicsumPage] = useState(1);
  interface PicsumPhoto {
    id: string;
    author: string;
    width: number;
    height: number;
    url: string;
    download_url: string;
  }
  const [picsumPhotos, setPicsumPhotos] = useState<PicsumPhoto[]>([]);
  const [picsumLoading, setPicsumLoading] = useState(false);
  const [picsumError, setPicsumError] = useState("");

  // Search Engine
  const [searchEngineId, setSearchEngineId] = useState(() => {
    if (typeof window === "undefined") return "google";
    return localStorage.getItem("slate-search-engine-id") || "google";
  });

  // Custom Search Engines
  const CUSTOM_ENGINE_MAX = 8;

  interface CustomEngine {
    id: string;
    name: string;
    url: string;
    domain: string;
  }

  const [customEngines, setCustomEngines] = useState<CustomEngine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("slate-custom-engines");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [deletedEngineIds, setDeletedEngineIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("slate-deleted-engines");
      if (saved) return JSON.parse(saved);
      const oldDisabled = localStorage.getItem("slate-disabled-engines");
      if (oldDisabled) {
        const parsed = JSON.parse(oldDisabled);
        localStorage.setItem("slate-deleted-engines", JSON.stringify(parsed));
        localStorage.removeItem("slate-disabled-engines");
        return parsed;
      }
    } catch {}
    return [];
  });

  const [isEditingCustomEngine, setIsEditingCustomEngine] = useState(false);
  const [editingCustomEngineId, setEditingCustomEngineId] = useState<string | null>(null);
  const [customEngineNameInput, setCustomEngineNameInput] = useState("");
  const [customEngineUrlInput, setCustomEngineUrlInput] = useState("");

  const customEngineModalRef = useRef<HTMLDivElement>(null);
  const customEngineNameRef = useRef<HTMLInputElement>(null);

  // Services Mode (Special Mode) States
  const [servicesEnabled, setServicesEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("slate-settings-services-enabled") === "true";
  });

  const [customServices, setCustomServices] = useState<CustomEngine[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("slate-custom-services");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [deletedServiceIds, setDeletedServiceIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("slate-deleted-services");
      if (saved) return JSON.parse(saved);
      const oldDisabled = localStorage.getItem("slate-disabled-services");
      if (oldDisabled) {
        const parsed = JSON.parse(oldDisabled);
        localStorage.setItem("slate-deleted-services", JSON.stringify(parsed));
        localStorage.removeItem("slate-disabled-services");
        return parsed;
      }
    } catch {}
    return SERVICES_PRESETS.filter((p) => !p.defaultEnabled).map((p) => p.id);
  });

  const [isEditingCustomService, setIsEditingCustomService] = useState(false);
  const [editingCustomServiceId, setEditingCustomServiceId] = useState<string | null>(null);
  const [customServiceNameInput, setCustomServiceNameInput] = useState("");
  const [customServiceUrlInput, setCustomServiceUrlInput] = useState("");

  const customServiceModalRef = useRef<HTMLDivElement>(null);
  const customServiceNameRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    getBackgroundBlob().then((blob) => {
      if (blob) {
        setHasUpload(true);
        setUploadPreview(URL.createObjectURL(blob));
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Outside click / Escape for custom engine modal
  useEffect(() => {
    if (!isEditingCustomEngine) return;
    const handleClick = (e: MouseEvent) => {
      if (customEngineModalRef.current && !customEngineModalRef.current.contains(e.target as Node)) {
        setIsEditingCustomEngine(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditingCustomEngine(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isEditingCustomEngine]);

  // Outside click / Escape for custom service modal
  useEffect(() => {
    if (!isEditingCustomService) return;
    const handleClick = (e: MouseEvent) => {
      if (customServiceModalRef.current && !customServiceModalRef.current.contains(e.target as Node)) {
        setIsEditingCustomService(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditingCustomService(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isEditingCustomService]);

  // Fetch Picsum Photos
  useEffect(() => {
    if (picsumSubTab !== "gallery") return;
    let active = true;
    const fetchPhotos = async () => {
      setPicsumLoading(true);
      setPicsumError("");
      try {
        const res = await fetch(`https://picsum.photos/v2/list?page=${picsumPage}&limit=16`);
        if (!res.ok) throw new Error("Failed to fetch web gallery");
        const data = await res.json();
        if (active) {
          setPicsumPhotos(data);
        }
      } catch (err: unknown) {
        if (active) {
          const errMsg = err instanceof Error ? err.message : "An error occurred";
          setPicsumError(errMsg);
        }
      } finally {
        if (active) {
          setPicsumLoading(false);
        }
      }
    };
    fetchPhotos();
    return () => {
      active = false;
    };
  }, [picsumPage, picsumSubTab]);

  const notifyBgUpdate = () => {
    window.dispatchEvent(new Event("slate-background-updated"));
  };

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("slate-theme", newTheme);
    window.dispatchEvent(new Event("slate-theme-updated"));
  };

  const handleGlowChange = (val: boolean) => {
    setGlowEnabled(val);
    localStorage.setItem("slate-settings-glow", val ? "true" : "false");
    document.documentElement.setAttribute("data-glow", val ? "true" : "false");
  };

  const handlePerfChange = (val: boolean) => {
    setPerformanceMode(val);
    localStorage.setItem("slate-settings-perf", val ? "true" : "false");
    document.documentElement.setAttribute("data-perf", val ? "true" : "false");
  };

  const handleWeatherChange = (val: boolean) => {
    setShowWeather(val);
    localStorage.setItem("slate-settings-weather", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-weather-updated"));
  };

  const handleTempUnitChange = (val: "celsius" | "fahrenheit") => {
    setTempUnit(val);
    localStorage.setItem("slate-temp-unit", val);
    window.dispatchEvent(new Event("slate-temp-unit-updated"));
  };

  const handleMailButtonChange = (val: boolean) => {
    setShowMailButton(val);
    localStorage.setItem("slate-settings-show-mail", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-mail-updated"));
  };

  const handleMailServiceChange = (val: "gmail" | "outlook" | "yahoo" | "custom") => {
    setMailService(val);
    localStorage.setItem("slate-mail-service", val);
    window.dispatchEvent(new Event("slate-mail-updated"));
  };

  const handleCustomMailUrlChange = (val: string) => {
    setCustomMailUrl(val);
    localStorage.setItem("slate-custom-mail-url", val);
    window.dispatchEvent(new Event("slate-mail-updated"));
  };
 
  const handleQuicklinksChange = (val: boolean) => {
    setShowQuicklinks(val);
    localStorage.setItem("slate-settings-quicklinks", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-quicklinks-settings-updated"));
  };
 
  const handleLabelsChange = (val: boolean) => {
    setShowLabels(val);
    localStorage.setItem("slate-settings-quicklinks-labels", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-quicklinks-settings-updated"));
  };
 
  const handleAddButtonChange = (val: boolean) => {
    setShowAddButton(val);
    localStorage.setItem("slate-settings-quicklinks-add-button", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-quicklinks-settings-updated"));
  };
 
  const handleSaveLinks = (updated: Quicklink[]) => {
    setQuicklinks(updated);
    localStorage.setItem("slate-quicklinks", JSON.stringify(updated));
    window.dispatchEvent(new Event("slate-quicklinks-settings-updated"));
  };
 
  const handleStartAddLink = () => {
    setEditingLinkId(null);
    setLinkNameInput("");
    setLinkUrlInput("");
    setIsEditingLink(true);
  };
 
  const handleStartEditLink = (link: Quicklink) => {
    setEditingLinkId(link.id);
    setLinkNameInput(link.title);
    setLinkUrlInput(link.url);
    setIsEditingLink(true);
  };
 
  const handleSaveLinkFromSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkNameInput.trim() || !linkUrlInput.trim()) return;
 
    let formattedUrl = linkUrlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }
 
    let updated: Quicklink[];
    if (editingLinkId) {
      updated = quicklinks.map(l => l.id === editingLinkId ? { ...l, title: linkNameInput.trim(), url: formattedUrl } : l);
    } else {
      if (quicklinks.length >= 12) return;
      const newLink: Quicklink = {
        id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: linkNameInput.trim(),
        url: formattedUrl
      };
      updated = [...quicklinks, newLink];
    }
    handleSaveLinks(updated);
    setIsEditingLink(false);
  };
 
  const handleDeleteLinkFromSettings = (id: string) => {
    const updated = quicklinks.filter(l => l.id !== id);
    handleSaveLinks(updated);
  };
 
  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const updated = [...quicklinks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    handleSaveLinks(updated);
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    localStorage.setItem("slate-username", val);
    window.dispatchEvent(new Event("slate-username-updated"));
  };

  const handleAccentChange = (val: string) => {
    setAccentColor(val);
    localStorage.setItem("slate-accent", val);
    document.documentElement.setAttribute("data-accent", val);

    if (val !== "custom") {
      document.documentElement.style.removeProperty('--custom-accent');
      document.documentElement.style.removeProperty('--custom-accent-light');
    } else {
      const savedCustom = localStorage.getItem("slate-custom-accent") || "#7ca38e";
      const savedCustomLight = localStorage.getItem("slate-accent-light") || "#4B6F58";
      document.documentElement.style.setProperty('--custom-accent', savedCustom);
      document.documentElement.style.setProperty('--custom-accent-light', savedCustomLight);
    }
  };

  const handleCustomColorSave = (hex: string, hsl: { h: number; s: number; l: number }) => {
    setCustomColor(hex);
    setCustomHsl(hsl);

    const lightColor = getLightAccentColor(hex);
    localStorage.setItem("slate-custom-accent", hex);
    localStorage.setItem("slate-accent-light", lightColor);
    
    setAccentColor("custom");
    localStorage.setItem("slate-accent", "custom");
    document.documentElement.setAttribute("data-accent", "custom");
  };

  const handleBgTypeChange = (type: "default" | "curated" | "upload" | "url") => {
    setBgType(type);
    localStorage.setItem("slate-bg-type", type);
    notifyBgUpdate();
  };

  const handleBgCuratedSelect = (url: string, photographer: string, profileUrl: string) => {
    setBgCuratedUrl(url);
    localStorage.setItem("slate-bg-curated-url", url);
    const credits = JSON.stringify({ name: photographer, url: profileUrl });
    localStorage.setItem("slate-bg-curated-credits", credits);
    notifyBgUpdate();
  };

  const handleBgUrlChange = (url: string) => {
    setBgUrlLink(url);
    localStorage.setItem("slate-bg-url-link", url);
    notifyBgUpdate();
  };

  const handleBgOpacityChange = (val: number) => {
    setBgOpacity(val);
    localStorage.setItem("slate-bg-opacity", val.toString());
    notifyBgUpdate();
  };

  const handleBgBlurChange = (val: number) => {
    setBgBlur(val);
    localStorage.setItem("slate-bg-blur", val.toString());
    notifyBgUpdate();
  };

  const handleBgDimChange = (val: number) => {
    setBgDim(val);
    localStorage.setItem("slate-bg-dim", val.toString());
    notifyBgUpdate();
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    try {
      await saveBackgroundBlob(file);
      setHasUpload(true);
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
      const newPreview = URL.createObjectURL(file);
      setUploadPreview(newPreview);
      handleBgTypeChange("upload");
    } catch (err) {
      console.error("Error saving background:", err);
      alert("Failed to save background image locally.");
    }
  };

  const handleRemoveUpload = async () => {
    try {
      await clearBackgroundBlob();
      setHasUpload(false);
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
      }
      if (bgType === "upload") {
        handleBgTypeChange("default");
      }
    } catch (err) {
      console.error("Error clearing background:", err);
    }
  };

  const handleRandomPicsum = async () => {
    setPicsumLoading(true);
    setPicsumError("");
    try {
      const randomPage = Math.floor(Math.random() * 30) + 1;
      const res = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch random background.");
      const photos = await res.json();
      if (photos.length === 0) throw new Error("No photos found.");
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
      const url = `https://picsum.photos/id/${randomPhoto.id}/1920/1080`;
      handleBgCuratedSelect(url, randomPhoto.author, randomPhoto.url);
      handleBgTypeChange("curated");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An error occurred.";
      setPicsumError(msg);
    } finally {
      setPicsumLoading(false);
    }
  };

  const handleSearchEngineChange = (id: string) => {
    setSearchEngineId(id);
    localStorage.setItem("slate-search-engine-id", id);
    window.dispatchEvent(new Event("slate-search-engine-updated"));
  };

  const handleDeleteEngine = (id: string) => {
    if (searchEngineId === id) {
      const remaining = [...ENGINES, ...customEngines].filter((e) => e.id !== id && !deletedEngineIds.includes(e.id));
      if (remaining.length > 0) {
        handleSearchEngineChange(remaining[0].id);
      } else {
        handleSearchEngineChange("google");
      }
    }

    if (!ENGINES.some((e) => e.id === id)) {
      const updatedCustom = customEngines.filter((e) => e.id !== id);
      handleSaveCustomEngines(updatedCustom);
    } else {
      const updatedDeleted = [...deletedEngineIds, id];
      setDeletedEngineIds(updatedDeleted);
      localStorage.setItem("slate-deleted-engines", JSON.stringify(updatedDeleted));
      window.dispatchEvent(new Event("slate-search-engine-updated"));
    }
  };

  const handleRestoreDefaultEngines = () => {
    setDeletedEngineIds([]);
    localStorage.removeItem("slate-deleted-engines");
    window.dispatchEvent(new Event("slate-search-engine-updated"));
  };

  // Custom Engine CRUD
  const handleSaveCustomEngines = (updated: CustomEngine[]) => {
    setCustomEngines(updated);
    localStorage.setItem("slate-custom-engines", JSON.stringify(updated));
    window.dispatchEvent(new Event("slate-search-engine-updated"));
  };

  const handleStartAddCustomEngine = () => {
    setEditingCustomEngineId(null);
    setCustomEngineNameInput("");
    setCustomEngineUrlInput("");
    setIsEditingCustomEngine(true);
    setTimeout(() => customEngineNameRef.current?.focus(), 50);
  };

  const handleStartEditCustomEngine = (engine: CustomEngine) => {
    setEditingCustomEngineId(engine.id);
    setCustomEngineNameInput(engine.name);
    setCustomEngineUrlInput(engine.url);
    setIsEditingCustomEngine(true);
    setTimeout(() => customEngineNameRef.current?.focus(), 50);
  };

  const handleSaveCustomEngineFromSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEngineNameInput.trim() || !customEngineUrlInput.trim()) return;

    let formattedUrl = customEngineUrlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    let domain = "";
    try {
      domain = new URL(formattedUrl).hostname;
    } catch {
      domain = "example.com";
    }

    let updated: CustomEngine[];
    if (editingCustomEngineId) {
      updated = customEngines.map(e =>
        e.id === editingCustomEngineId
          ? { ...e, name: customEngineNameInput.trim(), url: formattedUrl, domain }
          : e
      );
    } else {
      if (customEngines.length >= CUSTOM_ENGINE_MAX) return;
      const newEngine: CustomEngine = {
        id: generateUniqueId("custom"),
        name: customEngineNameInput.trim(),
        url: formattedUrl,
        domain,
      };
      updated = [...customEngines, newEngine];
    }
    handleSaveCustomEngines(updated);
    setIsEditingCustomEngine(false);
  };

  const handleDeleteCustomEngineFromSettings = (id: string) => {
    handleDeleteEngine(id);
  };

  const handleMoveCustomEngine = (index: number, direction: "up" | "down") => {
    const updated = [...customEngines];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleSaveCustomEngines(updated);
  };

  const handleServicesEnabledChange = (val: boolean) => {
    setServicesEnabled(val);
    localStorage.setItem("slate-settings-services-enabled", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-services-settings-updated"));
  };

  const handleDeleteService = (id: string) => {
    const activeServices = [...SERVICES_PRESETS, ...customServices].filter((s) => s.id !== id && !deletedServiceIds.includes(s.id));
    if (activeServices.length === 0) {
      return;
    }

    if (!SERVICES_PRESETS.some((s) => s.id === id)) {
      const updatedCustom = customServices.filter((s) => s.id !== id);
      handleSaveCustomServices(updatedCustom);
    } else {
      const updatedDeleted = [...deletedServiceIds, id];
      setDeletedServiceIds(updatedDeleted);
      localStorage.setItem("slate-deleted-services", JSON.stringify(updatedDeleted));
      window.dispatchEvent(new Event("slate-services-updated"));
    }
  };

  const handleRestoreDefaultServices = () => {
    const initial = SERVICES_PRESETS.filter((p) => !p.defaultEnabled).map((p) => p.id);
    setDeletedServiceIds(initial);
    localStorage.setItem("slate-deleted-services", JSON.stringify(initial));
    window.dispatchEvent(new Event("slate-services-updated"));
  };

  const handleSaveCustomServices = (updated: CustomEngine[]) => {
    setCustomServices(updated);
    localStorage.setItem("slate-custom-services", JSON.stringify(updated));
    window.dispatchEvent(new Event("slate-services-updated"));
  };

  const handleStartAddCustomService = () => {
    setEditingCustomServiceId(null);
    setCustomServiceNameInput("");
    setCustomServiceUrlInput("");
    setIsEditingCustomService(true);
    setTimeout(() => customServiceNameRef.current?.focus(), 50);
  };

  const handleStartEditCustomService = (service: CustomEngine) => {
    setEditingCustomServiceId(service.id);
    setCustomServiceNameInput(service.name);
    setCustomServiceUrlInput(service.url);
    setIsEditingCustomService(true);
    setTimeout(() => customServiceNameRef.current?.focus(), 50);
  };

  const handleSaveCustomServiceFromSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customServiceNameInput.trim() || !customServiceUrlInput.trim()) return;

    let formattedUrl = customServiceUrlInput.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    let domain = "";
    try {
      domain = new URL(formattedUrl).hostname;
    } catch {
      domain = "example.com";
    }

    let updated: CustomEngine[];
    if (editingCustomServiceId) {
      updated = customServices.map(e =>
        e.id === editingCustomServiceId
          ? { ...e, name: customServiceNameInput.trim(), url: formattedUrl, domain }
          : e
      );
    } else {
      if (customServices.length >= CUSTOM_ENGINE_MAX) return;
      const newService: CustomEngine = {
        id: generateUniqueId("custom-service"),
        name: customServiceNameInput.trim(),
        url: formattedUrl,
        domain,
      };
      updated = [...customServices, newService];
    }
    handleSaveCustomServices(updated);
    setIsEditingCustomService(false);
  };

  const handleDeleteCustomServiceFromSettings = (id: string) => {
    handleDeleteService(id);
  };

  const handleMoveCustomService = (index: number, direction: "up" | "down") => {
    const updated = [...customServices];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleSaveCustomServices(updated);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030307]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7ca38e]" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <User className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { id: "background", label: "Background", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "quicklinks", label: "Shortcuts", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "search", label: "Search Engine", icon: <Globe className="w-4 h-4" /> },
    { id: "support", label: "Support & Contact", icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="relative isolate min-h-screen w-full flex flex-col p-4 sm:p-8 md:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      <BackgroundOverlay />

      {/* Background glow circle */}
      <div className="absolute top-[20%] left-[60%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/6 blur-[90px] sm:blur-[140px] pointer-events-none -z-10 animate-breathe" />

      {/* Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-[var(--glass-border)]/60 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 active:scale-95 transition-all duration-300 cursor-pointer"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--accent)]" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]">Detailed Settings</h1>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              Fine-tune your Slate Tabs layout and behavior
            </p>
          </div>
        </div>
        <span className="text-[10px] tracking-[0.2em] font-light text-[var(--foreground)]/40 dark:text-[var(--accent)]/55 uppercase select-none">
          Slate Tabs v{siteConfig.version}
        </span>
      </header>

      {/* Main Grid Content */}
      <main className="w-full max-w-5xl mx-auto flex-1 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        {/* Navigation Sidebar */}
        <aside className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap md:w-full border backdrop-blur-2xl
                  ${isActive
                    ? "bg-[var(--glass-bg)] border-[var(--accent)] text-[var(--accent)] shadow-sm"
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]/85"
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-[var(--accent)]/8 pointer-events-none" />
                )}
                <span className={`relative z-10 ${isActive ? "text-[var(--accent)]" : "text-[var(--foreground)]/45"}`}>
                  {tab.icon}
                </span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Content Card */}
        <section className="rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 relative min-h-[450px]">
          
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3">
                <h3 className="text-base font-medium">General Preferences</h3>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">Configure layout preferences and personalization settings.</p>
              </div>

              {/* Username Settings */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--accent)]" /> Your Display Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Enter name (e.g. Alex)..."
                  maxLength={20}
                  className="w-full max-w-md h-[42px] px-4 rounded-lg bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/6 transition-all duration-300"
                />
                <span className="text-[10px] text-[var(--foreground)]/40 leading-relaxed">
                  Appends your name to the main greeting (e.g. Good morning, Alex).
                </span>
              </div>

              {/* Toggle List */}
              <div className="flex flex-col gap-5 mt-2 max-w-2xl">
                {/* Weather Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]/40">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                      <CloudSun className="w-4 h-4 text-[var(--accent)]" /> Weather Widget
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50">
                      Show current weather in the corner.
                    </span>
                  </div>
                  <button
                    onClick={() => handleWeatherChange(!showWeather)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 cursor-pointer ${
                      showWeather ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        showWeather ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Temperature Unit */}
                {showWeather && (
                  <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]/40 animate-suggest-in">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-[var(--accent)]" /> Temperature Unit
                      </span>
                      <span className="text-xs text-[var(--foreground)]/50">
                        Choose Celsius or Fahrenheit for the weather forecast.
                      </span>
                    </div>
                    <div className="flex gap-2 max-w-sm">
                      <button
                        onClick={() => handleTempUnitChange("celsius")}
                        className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                          tempUnit === "celsius"
                            ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                            : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                        }`}
                      >
                        Celsius (°C)
                      </button>
                      <button
                        onClick={() => handleTempUnitChange("fahrenheit")}
                        className={`flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                          tempUnit === "fahrenheit"
                            ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                            : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                        }`}
                      >
                        Fahrenheit (°F)
                      </button>
                    </div>
                  </div>
                )}

                {/* Mail Shortcut Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]/40">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--accent)]" /> Mail Shortcut
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50">
                      Show quick-access mail button in the top right.
                    </span>
                  </div>
                  <button
                    onClick={() => handleMailButtonChange(!showMailButton)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 cursor-pointer ${
                      showMailButton ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        showMailButton ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Mail Service Selection */}
                {showMailButton && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-[var(--glass-border)]/40 animate-suggest-in">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                        Mail Service
                      </span>
                      <span className="text-xs text-[var(--foreground)]/50">
                        Choose your preferred mail provider.
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[280px]">
                      <div className="flex gap-2 flex-wrap">
                        {(["gmail", "outlook", "yahoo", "custom"] as const).map((service) => (
                          <button
                            key={service}
                            onClick={() => handleMailServiceChange(service)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl border text-xs font-semibold transition-all duration-300 cursor-pointer capitalize ${
                              mailService === service
                                ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                                : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                      {mailService === "custom" && (
                        <input
                          type="text"
                          value={customMailUrl}
                          onChange={(e) => handleCustomMailUrlChange(e.target.value)}
                          placeholder="https://mail.proton.me"
                          className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/6 transition-all duration-300"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3">
                <h3 className="text-base font-medium">Appearance & Styling</h3>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">Configure active themes, accent schemes, and custom color presets.</p>
              </div>

              {/* Theme Settings */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                  Color Mode Theme
                </span>
                <div className="flex gap-3 max-w-sm">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-300 cursor-pointer ${
                      theme === "dark"
                        ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Dark Mode
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-300 cursor-pointer ${
                      theme === "light"
                        ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <Sun className="w-4 h-4" /> Light Mode
                  </button>
                </div>
              </div>

              {/* Accent Presets */}
              <div className="flex flex-col gap-3 border-t border-[var(--glass-border)]/40 pt-5">
                <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                  Accent Preset Color
                </span>
                <div className="flex items-center gap-3.5 flex-wrap">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleAccentChange(preset.id)}
                      className={`w-9 h-9 rounded-full cursor-pointer transition-all duration-300 relative flex items-center justify-center border hover:scale-110 active:scale-95
                        ${accentColor === preset.id
                          ? "border-[var(--foreground)] scale-105 shadow-md"
                          : "border-[var(--foreground)]/10"}`}
                      style={{ backgroundColor: theme === "light" ? preset.lightColor : preset.color }}
                      title={preset.name}
                    >
                      {accentColor === preset.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--background)]" />
                      )}
                    </button>
                  ))}

                  {/* Custom color button */}
                  <button
                    onClick={() => handleAccentChange("custom")}
                    className={`w-9 h-9 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-95
                      ${accentColor === "custom"
                        ? "border-[var(--foreground)] scale-105 shadow-md"
                        : "border-[var(--foreground)]/10"}`}
                    style={{
                      background: accentColor === "custom"
                        ? (theme === "light" ? getLightAccentColor(customColor) : customColor)
                        : "conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #7f00ff, #ff00ff, #ff0000)",
                    }}
                    title="Custom Color"
                  >
                    {accentColor === "custom" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--background)]" />
                    ) : (
                      <span className="text-[12px] font-bold text-white shadow-sm drop-shadow-md">+</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Picker Panel */}
              {accentColor === "custom" && (
                <CustomPickerPanel
                  initialHsl={customHsl}
                  initialColor={customColor}
                  theme={theme}
                  onColorChange={handleCustomColorSave}
                />
              )}

              {/* Layout & Animation Options */}
              <div className="flex flex-col gap-5 border-t border-[var(--glass-border)]/40 pt-5 mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50">
                  Layout & Animations
                </span>

                {/* Glow Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]/40">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[var(--accent)]" /> Ambient Glow
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50">
                      Enable soft ambient breathing glow behind coordinates and search inputs.
                    </span>
                  </div>
                  <button
                    onClick={() => handleGlowChange(!glowEnabled)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 cursor-pointer ${
                      glowEnabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        glowEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Low Motion Toggle */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[var(--accent)]" /> Low Motion Mode
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50">
                      Disables intensive breathing, blur transitions, and fly stagger animations.
                    </span>
                  </div>
                  <button
                    onClick={() => handlePerfChange(!performanceMode)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 cursor-pointer ${
                      performanceMode ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        performanceMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Background Wallpaper Tab */}
          {activeTab === "background" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3">
                <h3 className="text-base font-medium">Background Wallpaper</h3>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">Configure background themes, custom wallpaper sources, and overlay opacity.</p>
              </div>

              {/* Source Buttons */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-[var(--foreground)]/90">Background Image Source</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "default", name: "Default Glow", icon: <Sparkles className="w-4 h-4 text-[var(--accent)]" /> },
                    { id: "curated", name: "Presets & Gallery", icon: <ImageIcon className="w-4 h-4 text-[var(--accent)]" /> },
                    { id: "upload", name: "Custom Upload", icon: <Upload className="w-4 h-4 text-[var(--accent)]" /> },
                    { id: "url", name: "Image Link", icon: <LinkIcon className="w-4 h-4 text-[var(--accent)]" /> }
                  ].map((src) => {
                    const isSel = bgType === src.id;
                    return (
                      <button
                        key={src.id}
                        onClick={() => handleBgTypeChange(src.id as typeof bgType)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all duration-300 cursor-pointer ${
                          isSel
                            ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)]"
                            : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                        }`}
                      >
                        {src.icon}
                        <span className="text-xs font-semibold">{src.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Panel */}
              <div className="flex flex-col gap-4">
                {bgType === "default" && (
                  <div className="p-4 rounded-xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 text-xs leading-relaxed text-[var(--foreground)]/60 max-w-2xl">
                    Default Gradient features an Obsidian Black space texture synchronized with your ambient accent glow, producing a highly elegant, performance-oriented aesthetic.
                  </div>
                )}

                {bgType === "curated" && (
                  <div className="flex flex-col gap-5 border border-[var(--glass-border)]/40 rounded-xl p-5 bg-[var(--foreground)]/2 max-w-3xl">
                    {/* Sub Tab Switcher */}
                    <div className="flex gap-2 border-b border-[var(--glass-border)]/30 pb-2">
                      <button
                        type="button"
                        onClick={() => setPicsumSubTab("presets")}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          picsumSubTab === "presets"
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                        }`}
                      >
                        Curated Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setPicsumSubTab("gallery")}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          picsumSubTab === "gallery"
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                        }`}
                      >
                        Web Gallery
                      </button>
                    </div>

                    {/* Presets Sub-Tab */}
                    {picsumSubTab === "presets" && (
                      <div className="flex flex-col gap-5 animate-suggest-in">
                        <div>
                          <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Preset Library</span>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2.5">
                            {CURATED_BACKGROUNDS.map((bg) => (
                              <button
                                key={bg.id}
                                onClick={() => handleBgCuratedSelect(bg.url, bg.photographer, bg.profileUrl)}
                                className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 relative group cursor-pointer ${
                                  bgType === "curated" && bgCuratedUrl === bg.url
                                    ? "border-[var(--accent)] scale-95 shadow-md"
                                    : "border-transparent hover:scale-105"
                                }`}
                                title={`Photo by ${bg.photographer}`}
                              >
                                <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover select-none" />
                                {bgType === "curated" && bgCuratedUrl === bg.url && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>


                      </div>
                    )}

                    {/* Picsum Web Gallery Sub-Tab */}
                    {picsumSubTab === "gallery" && (
                      <div className="flex flex-col gap-4 animate-suggest-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Browse Web Photos (Lorem Picsum)</span>
                          <button
                            type="button"
                            onClick={handleRandomPicsum}
                            disabled={picsumLoading}
                            className="h-8 px-3 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--accent)] border border-[var(--glass-border)]/55 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Random Surprise
                          </button>
                        </div>
                        
                        {picsumLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                          </div>
                        ) : picsumError ? (
                          <span className="text-xs text-red-400 font-medium">{picsumError}</span>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-1">
                              {picsumPhotos.map((photo) => {
                                const photoUrl = `https://picsum.photos/id/${photo.id}/1920/1080`;
                                const thumbUrl = `https://picsum.photos/id/${photo.id}/240/240`;
                                const isSelected = bgType === "curated" && bgCuratedUrl === photoUrl;
                                return (
                                  <button
                                    key={photo.id}
                                    onClick={() => handleBgCuratedSelect(photoUrl, photo.author, photo.url)}
                                    className={`aspect-square rounded-lg overflow-hidden border transition-all duration-300 relative group cursor-pointer ${
                                      isSelected ? "border-[var(--accent)] scale-95 shadow-md" : "border-transparent hover:scale-105"
                                    }`}
                                    title={`Photo by ${photo.author}`}
                                  >
                                    <img
                                      src={thumbUrl}
                                      alt={`Photo by ${photo.author}`}
                                      className="w-full h-full object-cover select-none"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between border-t border-[var(--glass-border)]/40 pt-4 mt-2">
                              <button
                                type="button"
                                disabled={picsumPage <= 1}
                                onClick={() => setPicsumPage((p) => Math.max(1, p - 1))}
                                className="px-3.5 py-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-all duration-300"
                              >
                                <ChevronLeft className="w-4 h-4" /> Previous
                              </button>
                              <span className="text-xs text-[var(--foreground)]/60 font-medium">Page {picsumPage}</span>
                              <button
                                type="button"
                                onClick={() => setPicsumPage((p) => p + 1)}
                                className="px-3.5 py-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 cursor-pointer flex items-center gap-1 transition-all duration-300"
                              >
                                Next <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {bgType === "upload" && (
                  <div className="flex flex-col gap-4 mt-1 max-w-xl">
                    {hasUpload && uploadPreview ? (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[var(--glass-border)] group">
                        <img src={uploadPreview} alt="Custom Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-350">
                          <button
                            onClick={handleRemoveUpload}
                            className="p-3 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                            title="Delete custom upload"
                          >
                            <Trash2 className="w-4 h-4" /> Clear Upload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border border-dashed border-[var(--glass-border)] hover:border-[var(--accent)]/50 rounded-xl bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer text-center p-6">
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-8 h-8 text-[var(--accent)]" />
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-[var(--foreground)]/80">Choose Wallpaper Image</span>
                            <span className="text-xs text-[var(--foreground)]/40">PNG, JPG, or WEBP. Image is saved locally.</span>
                          </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                )}

                {bgType === "url" && (
                  <div className="flex flex-col gap-2 mt-1 max-w-xl">
                    <span className="text-sm font-medium text-[var(--foreground)]/85">Wallpaper Link (URL)</span>
                    <input
                      type="text"
                      value={bgUrlLink}
                      onChange={(e) => handleBgUrlChange(e.target.value)}
                      placeholder="Paste image link (e.g. https://example.com/image.jpg)..."
                      className="w-full h-[40px] px-3.5 rounded-lg bg-[var(--foreground)]/4 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
                    />
                    <span className="text-[10px] text-[var(--foreground)]/40 leading-relaxed">
                      Enter the direct image URL address. Hotlinking directly displays the target file.
                    </span>
                  </div>
                )}
              </div>

              {/* Adjustments Sliders */}
              {bgType !== "default" && (
                <div className="flex flex-col gap-5 border-t border-[var(--glass-border)]/40 pt-5 mt-2 max-w-xl">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Wallpaper Adjustments</span>

                  {/* Opacity */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]/85">
                      <span>Wallpaper Opacity</span>
                      <span>{bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={bgOpacity}
                      onChange={(e) => handleBgOpacityChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>

                  {/* Dim */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]/85">
                      <span>Dim Overlay Darkness</span>
                      <span>{bgDim}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={bgDim}
                      onChange={(e) => handleBgDimChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>

                  {/* Blur */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]/85">
                      <span>Blur Intensity</span>
                      <span>{bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={bgBlur}
                      onChange={(e) => handleBgBlurChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3">
                <h3 className="text-base font-medium">Search Preferences</h3>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">Select your active search provider and autocomplete settings.</p>
              </div>

              {/* Services Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--foreground)]/3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[var(--foreground)]/90 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--accent)]" /> Enable Services Search Mode
                  </span>
                  <span className="text-[11px] text-[var(--foreground)]/45">
                    Allows searching specific services (like YouTube, GitHub, Wikipedia) directly via `/mode` or the header tab switcher.
                  </span>
                </div>
                <button
                  onClick={() => handleServicesEnabledChange(!servicesEnabled)}
                  className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] cursor-pointer ${
                    servicesEnabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                  }`}
                  title={servicesEnabled ? "Disable Services Mode" : "Enable Services Mode"}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[var(--background)] shadow transition-transform duration-300 ${
                      servicesEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Engine Grid */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--foreground)]/90 flex items-center gap-2">
                    Active Search Engine
                  </span>
                  {deletedEngineIds.length > 0 && (
                    <button
                      onClick={handleRestoreDefaultEngines}
                      className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors duration-200 cursor-pointer"
                    >
                      Restore Defaults
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...ENGINES, ...customEngines]
                    .filter((engine) => !deletedEngineIds.includes(engine.id))
                    .map((engine) => {
                      const isSel = searchEngineId === engine.id;
                      return (
                        <div
                          key={engine.id}
                          onClick={() => handleSearchEngineChange(engine.id)}
                          className={`relative flex items-center gap-3.5 p-4 rounded-xl border text-left font-medium transition-all duration-300 cursor-pointer hover:-translate-y-[1px] active:translate-y-0
                            ${isSel
                              ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] shadow-sm"
                              : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                            }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center shrink-0">
                            <img
                              src={`https://www.google.com/s2/favicons?sz=64&domain=${"domain" in engine ? engine.domain : "example.com"}`}
                              alt=""
                              className="w-4 h-4 object-contain filter dark:brightness-95"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 pr-8">
                            <span className="text-xs font-semibold leading-tight truncate flex items-center gap-1.5">
                              {engine.name}
                              {'url' in engine && !ENGINES.some(e => e.id === engine.id) && (
                                <span className="text-[8px] px-1 py-0.5 rounded-full bg-[var(--accent)]/8 text-[var(--accent)] font-medium uppercase tracking-wider">
                                  Custom
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-[var(--foreground)]/45 truncate mt-0.5">{engine.domain}</span>
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDeleteEngine(engine.id)}
                              disabled={isSel}
                              className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                                isSel
                                  ? "opacity-20 cursor-not-allowed text-[var(--accent)]"
                                  : "text-[var(--foreground)]/40 hover:text-rose-400 hover:bg-rose-500/10"
                              }`}
                              title={isSel ? "Active search engine cannot be deleted" : "Delete search engine"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <span className="text-[10px] text-[var(--foreground)]/40 leading-relaxed mt-1">
                  Changing the active engine immediately configures default prefixes and suggestion completions.
                </span>
              </div>

              {/* Custom Search Engines */}
              <div className="flex flex-col gap-4 border-t border-[var(--glass-border)]/40 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)]/90">Custom Search Engines</h4>
                    <p className="text-[11px] text-[var(--foreground)]/45 mt-0.5">
                      Add your own search engines. Use <code className="text-[var(--accent)] bg-[var(--accent)]/8 px-1 rounded text-[10px] font-mono">%s</code> as the query placeholder.
                    </p>
                  </div>
                  <button
                    onClick={handleStartAddCustomEngine}
                    disabled={customEngines.length >= CUSTOM_ENGINE_MAX}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Engine
                  </button>
                </div>

                {/* Custom Engine Modal */}
                {isEditingCustomEngine && mounted && typeof document !== "undefined" && createPortal(
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
                    <div
                      ref={customEngineModalRef}
                      className="w-full max-w-sm rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative"
                    >
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomEngine(false)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <h3 className="text-base font-semibold text-[var(--foreground)]">
                        {editingCustomEngineId ? "Edit Custom Engine" : "Add Custom Engine"}
                      </h3>

                      <form onSubmit={handleSaveCustomEngineFromSettings} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                            Engine Name
                          </label>
                          <input
                            ref={customEngineNameRef}
                            type="text"
                            placeholder="e.g. My Search"
                            value={customEngineNameInput}
                            onChange={(e) => setCustomEngineNameInput(e.target.value)}
                            required
                            maxLength={20}
                            className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                            Search URL
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. https://example.com/search?q=%s"
                            value={customEngineUrlInput}
                            onChange={(e) => setCustomEngineUrlInput(e.target.value)}
                            required
                            className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300 font-mono text-xs"
                          />
                          <span className="text-[10px] text-[var(--foreground)]/40 leading-relaxed">
                            Use <code className="text-[var(--accent)] font-mono">%s</code> as the placeholder for the search query.
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-2">
                          {editingCustomEngineId ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomEngineFromSettings(editingCustomEngineId)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl transition-all duration-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          ) : (
                            <div />
                          )}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingCustomEngine(false)}
                              className="px-4 py-2 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 rounded-xl hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 cursor-pointer"
                            >
                              Save Engine
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>,
                  document.body
                )}
                {customEngines.length === 0 ? (
                      <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--glass-border)] text-sm text-[var(--foreground)]/40">
                        No custom engines added yet. Add one to see it appear in the search engine picker.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 rounded-2xl p-4">
                        <span className="text-[11px] font-semibold text-[var(--foreground)]/50 uppercase tracking-wider px-1">
                          {customEngines.length} / {CUSTOM_ENGINE_MAX} Engines
                        </span>
                        {customEngines.map((engine, idx) => {
                          const isActive = searchEngineId === engine.id;
                          return (
                            <div
                              key={engine.id}
                              className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                                  : "border-[var(--glass-border)]/30 bg-[var(--background)]/30 hover:bg-[var(--foreground)]/5"
                              }`}
                              onClick={() => handleSearchEngineChange(engine.id)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isActive
                                    ? "bg-[var(--accent)]/10 border-[var(--accent)]/25"
                                    : "bg-[var(--foreground)]/5 border-[var(--glass-border)]/35"
                                }`}>
                                  <img
                                    src={`https://www.google.com/s2/favicons?sz=64&domain=${engine.domain}`}
                                    alt=""
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                    className="w-4 h-4 object-contain filter dark:brightness-95"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold leading-tight truncate">{engine.name}</span>
                                  <span className="text-[10px] text-[var(--foreground)]/45 truncate mt-0.5 font-mono">{engine.url}</span>
                                </div>
                                {isActive && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold shrink-0">
                                    Active
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleMoveCustomEngine(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveCustomEngine(idx, "down")}
                                  disabled={idx === customEngines.length - 1}
                                  className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStartEditCustomEngine(engine)}
                                  className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 transition-all duration-200 cursor-pointer"
                                  title="Edit Engine"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomEngineFromSettings(engine.id)}
                                  className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
              </div>

              {/* Services (Special Mode) Settings Grid & Custom Panel */}
              {servicesEnabled && (
                <div className="flex flex-col gap-4 border-t border-[var(--glass-border)]/40 pt-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--foreground)]/90">Services Search (Special Mode)</h4>
                      <p className="text-[11px] text-[var(--foreground)]/45 mt-0.5">
                        Configure search providers for Services mode. Delete them to hide them.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {deletedServiceIds.length > 0 && (
                        <button
                          onClick={handleRestoreDefaultServices}
                          className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors duration-200 cursor-pointer"
                        >
                          Restore Defaults
                        </button>
                      )}
                      <button
                        onClick={handleStartAddCustomService}
                        disabled={customServices.length >= CUSTOM_ENGINE_MAX}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all duration-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Service
                      </button>
                    </div>
                  </div>

                  {/* Preset Services Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[...SERVICES_PRESETS, ...customServices]
                      .filter((service) => !deletedServiceIds.includes(service.id))
                      .map((service, idx, arr) => {
                        const isLast = arr.length <= 1;
                        return (
                          <div
                            key={service.id}
                            className="relative flex items-center gap-3.5 p-4 rounded-xl border text-left font-medium transition-all duration-300 cursor-default bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/40 flex items-center justify-center shrink-0">
                              <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${service.domain}`}
                                alt=""
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                                className="w-4 h-4 object-contain filter dark:brightness-95"
                              />
                            </div>
                            <div className="flex flex-col min-w-0 pr-8">
                              <span className="text-xs font-semibold leading-tight truncate flex items-center gap-1.5">
                                {service.name}
                                {!SERVICES_PRESETS.some((e) => e.id === service.id) && (
                                  <span className="text-[8px] px-1 py-0.5 rounded-full bg-[var(--accent)]/8 text-[var(--accent)] font-medium uppercase tracking-wider">
                                    Custom
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-[var(--foreground)]/45 truncate mt-0.5">{service.domain}</span>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id)}
                                disabled={isLast}
                                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                                  isLast
                                    ? "opacity-20 cursor-not-allowed text-[var(--foreground)]/30"
                                    : "text-[var(--foreground)]/40 hover:text-rose-400 hover:bg-rose-500/10"
                                }`}
                                title={isLast ? "At least one service must remain" : "Delete service"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Custom Services Section */}
                  {customServices.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--glass-border)] text-sm text-[var(--foreground)]/40 mt-1">
                      No custom services added yet. Add one to see it appear in the services search picker.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 rounded-2xl p-4 mt-1">
                      <span className="text-[11px] font-semibold text-[var(--foreground)]/50 uppercase tracking-wider px-1">
                        {customServices.length} / {CUSTOM_ENGINE_MAX} Services
                      </span>
                      {customServices.map((service, idx) => {
                        return (
                          <div
                            key={service.id}
                            className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[var(--glass-border)]/30 bg-[var(--background)]/30 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-[var(--foreground)]/5 border-[var(--glass-border)]/35">
                                <img
                                  src={`https://www.google.com/s2/favicons?sz=64&domain=${service.domain}`}
                                  alt=""
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                  className="w-4 h-4 object-contain filter dark:brightness-95"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold leading-tight truncate">{service.name}</span>
                                <span className="text-[10px] text-[var(--foreground)]/45 truncate mt-0.5 font-mono">{service.url}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleMoveCustomService(idx, "up")}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveCustomService(idx, "down")}
                                disabled={idx === customServices.length - 1}
                                className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStartEditCustomService(service)}
                                className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 transition-all duration-200 cursor-pointer"
                                title="Edit Service"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCustomServiceFromSettings(service.id)}
                                className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Service Modal Portal */}
              {isEditingCustomService && mounted && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
                  <div
                    ref={customServiceModalRef}
                    className="w-full max-w-sm rounded-2xl glass-input p-6 flex flex-col gap-4 animate-scale-up text-left relative"
                  >
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomService(false)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 cursor-pointer transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      {editingCustomServiceId ? "Edit Custom Service" : "Add Custom Service"}
                    </h3>

                    <form onSubmit={handleSaveCustomServiceFromSettings} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                          Service Name
                        </label>
                        <input
                          ref={customServiceNameRef}
                          type="text"
                          placeholder="e.g. My Service"
                          value={customServiceNameInput}
                          onChange={(e) => setCustomServiceNameInput(e.target.value)}
                          required
                          maxLength={20}
                          className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                          Search URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://example.com/search?q=%s"
                          value={customServiceUrlInput}
                          onChange={(e) => setCustomServiceUrlInput(e.target.value)}
                          required
                          className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300 font-mono text-xs"
                        />
                        <span className="text-[10px] text-[var(--foreground)]/40 leading-relaxed">
                          Use <code className="text-[var(--accent)] font-mono">%s</code> as the placeholder for the search query.
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-2">
                        {editingCustomServiceId ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomServiceFromSettings(editingCustomServiceId)}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl transition-all duration-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        ) : (
                          <div />
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingCustomService(false)}
                            className="px-4 py-2 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 rounded-xl hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 cursor-pointer"
                          >
                            Save Service
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>,
                document.body
              )}
            </div>
          )}

          {/* Quicklinks Tab */}
          {activeTab === "quicklinks" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">Quicklinks Settings</h3>
                  <p className="text-xs text-[var(--foreground)]/50 mt-1">Configure shortcut bar layout, visibility, and site bookmarks.</p>
                </div>
                {showQuicklinks && !isEditingLink && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    quicklinks.length >= 12
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}>
                    {quicklinks.length} / 12 Links
                  </span>
                )}
              </div>

              {/* Edit Mode / Form */}
              {isEditingLink ? (
                <form onSubmit={handleSaveLinkFromSettings} className="flex flex-col gap-4 max-w-md bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 p-5 rounded-2xl">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">
                    {editingLinkId ? "Edit Shortcut" : "Add New Shortcut"}
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                      Shortcut Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GitHub"
                      value={linkNameInput}
                      onChange={(e) => setLinkNameInput(e.target.value)}
                      required
                      maxLength={15}
                      className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium tracking-wide uppercase text-[var(--foreground)]/50">
                      Shortcut URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com"
                      value={linkUrlInput}
                      onChange={(e) => setLinkUrlInput(e.target.value)}
                      required
                      className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingLink(false)}
                      className="px-4 py-2 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 rounded-xl hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 cursor-pointer"
                    >
                      Save Shortcut
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Preferences Toggles */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-semibold text-[var(--foreground)]/90">Layout Options</h4>
                    <div className="flex flex-col gap-1 rounded-2xl bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 p-4">
                      {/* Toggle Quicklinks */}
                      <div className="flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">Enable Quicklinks Bar</span>
                          <span className="text-[11px] text-[var(--foreground)]/45">Show the shortcuts bar below the search bar</span>
                        </div>
                        <button
                          onClick={() => handleQuicklinksChange(!showQuicklinks)}
                          className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                            showQuicklinks ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              showQuicklinks ? "translate-x-5" : "translate-x-0"
                            } active:scale-x-125`}
                          />
                        </button>
                      </div>

                      {/* Toggle Labels */}
                      <div className="flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">Show Text Labels</span>
                          <span className="text-[11px] text-[var(--foreground)]/45">Show name labels below shortcut icons</span>
                        </div>
                        <button
                          onClick={() => handleLabelsChange(!showLabels)}
                          className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                            showLabels ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              showLabels ? "translate-x-5" : "translate-x-0"
                            } active:scale-x-125`}
                          />
                        </button>
                      </div>

                      {/* Toggle Add Button */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">Show Add Button</span>
                          <span className="text-[11px] text-[var(--foreground)]/45">Show the &quot;+&quot; shortcut in the grid</span>
                        </div>
                        <button
                          onClick={() => handleAddButtonChange(!showAddButton)}
                          className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                            showAddButton ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              showAddButton ? "translate-x-5" : "translate-x-0"
                            } active:scale-x-125`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shortcuts Manager List */}
                  {showQuicklinks && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[var(--foreground)]/90">Shortcuts List</h4>
                        <button
                          onClick={handleStartAddLink}
                          disabled={quicklinks.length >= 12}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent)]/90 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-all duration-300 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Shortcut
                        </button>
                      </div>

                      {quicklinks.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl border border-dashed border-[var(--glass-border)] text-sm text-[var(--foreground)]/40">
                          No shortcuts added yet.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 bg-[var(--foreground)]/3 border border-[var(--glass-border)]/45 rounded-2xl p-4">
                          {quicklinks.map((link, idx) => {
                            const domain = getDomain(link.url);
                            return (
                              <div
                                key={link.id}
                                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[var(--glass-border)]/30 bg-[var(--background)]/30 hover:bg-[var(--foreground)]/5 transition-all duration-200"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/35 flex items-center justify-center shrink-0">
                                    <SettingsFavicon domain={domain} title={link.title} />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold leading-tight truncate">{link.title}</span>
                                    <span className="text-[10px] text-[var(--foreground)]/45 truncate mt-0.5">{link.url}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Move Up */}
                                  <button
                                    onClick={() => handleMoveLink(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    onClick={() => handleMoveLink(idx, "down")}
                                    disabled={idx === quicklinks.length - 1}
                                    className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 disabled:opacity-20 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>

                                  {/* Edit */}
                                  <button
                                    onClick={() => handleStartEditLink(link)}
                                    className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 transition-all duration-200 cursor-pointer"
                                    title="Edit Shortcut"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleDeleteLinkFromSettings(link.id)}
                                    className="p-1.5 rounded-lg text-[var(--foreground)]/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Support & Contact Tab */}
          {activeTab === "support" && (
            <div className="flex flex-col gap-6 animate-suggest-in">
              <div className="border-b border-[var(--glass-border)] pb-3">
                <h3 className="text-base font-medium">Support & Community</h3>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">Get support, report bugs, share feedback, and join our community.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Discord Card */}
                <div className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.04] transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                      <svg
                        className="w-6 h-6 transition-transform duration-500 group-hover:scale-110"
                        viewBox="0 0 127.14 96.36"
                        fill="currentColor"
                      >
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5A51.72,51.72,0,0,0,30,78.82a74.37,74.37,0,0,0,67.13,0,51.72,51.72,0,0,0,1.87,1.69,68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.84,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-semibold text-[var(--foreground)]">Discord Server</h4>
                      <p className="text-xs text-[var(--foreground)]/60 leading-relaxed">
                        Join our Discord community to connect with other developers, share your workspace setup, request features, and get live help.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={siteConfig.links.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold rounded-xl hover:shadow-[0_0_12px_rgba(88,101,242,0.35)] transition-all duration-300 cursor-pointer active:scale-95 text-center"
                    >
                      Join Discord
                    </a>
                    <button
                      onClick={handleCopyInvite}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/6 border border-[var(--glass-border)] text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer active:scale-95 min-w-[140px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <span>Copy Invite Link</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* GitHub Card */}
                <div className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.04] transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--foreground)]/5 border border-[var(--glass-border)] flex items-center justify-center text-[var(--foreground)]/80">
                      <svg
                        className="w-6 h-6 transition-transform duration-500 group-hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-semibold text-[var(--foreground)]">Report Bugs & Issues</h4>
                      <p className="text-xs text-[var(--foreground)]/60 leading-relaxed">
                        Encountered a bug or want to request a feature formally? Open an issue on our GitHub repository. We welcome contributions!
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={`${siteConfig.links.github}/issues`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-[var(--accent)] hover:bg-[var(--accent)]/95 text-[var(--background)] text-xs font-semibold rounded-xl hover:shadow-[0_0_12px_var(--accent-glow)] transition-all duration-300 cursor-pointer active:scale-95 text-center"
                    >
                      Open GitHub Issue
                    </a>
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/6 border border-[var(--glass-border)] text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer active:scale-95 text-center"
                    >
                      Star on GitHub
                    </a>
                  </div>
                </div>
              </div>

              {/* Version & Info Callout */}
              <div className="mt-4 p-4 rounded-xl border border-[var(--glass-border)]/50 bg-[var(--foreground)]/[0.01] flex items-start gap-3">
                <div className="p-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]/90">About Slate Tabs</span>
                    <div className="flex gap-2 text-[10px] text-[var(--foreground)]/40">
                      <Link href="/tos" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link>
                      <span>&middot;</span>
                      <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--foreground)]/50 leading-relaxed mt-1">
                    Slate Tabs is an open source project built with minimalist design, performance, and user privacy in mind. Thank you for your support!
                  </p>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      <footer className="w-full max-w-5xl mx-auto pt-8 pb-4 flex justify-between border-t border-[var(--glass-border)]/20 mt-8 select-none" suppressHydrationWarning>
        <span className="text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <div className="flex gap-4 text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          <Link href="/tos" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors cursor-pointer">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
