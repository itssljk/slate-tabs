"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { X, Shield, Eye, Cpu, User, Palette, Image as ImageIcon, Upload, Link as LinkIcon, ChevronLeft, Sparkles, Trash2, Loader2, SlidersHorizontal, CloudSun, LayoutGrid, Thermometer, Mail } from "lucide-react";
import { saveBackgroundBlob, clearBackgroundBlob, getBackgroundBlob, DEFAULT_BG_SETTINGS } from "@/utils/backgroundDb";
import { ACCENT_PRESETS, getLightAccentColor, hexToHsl, hslToHex } from "@/utils/accent";
import { CURATED_BACKGROUNDS } from "@/utils/backgrounds";
import { siteConfig } from "@/config/site";
import { getSettingsUrl } from "@/utils/navigation";

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
  const [showWeather, setShowWeather] = useState(true);
  const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [showQuicklinks, setShowQuicklinks] = useState(true);
  const [username, setUsername] = useState("");
  const [accentColor, setAccentColor] = useState("sage");
  const [customColor, setCustomColor] = useState("#7ca38e");
  const [customHsl, setCustomHsl] = useState({ h: 147, s: 18, l: 56 });
  const [hexInputValue, setHexInputValue] = useState("#7ca38e");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  // Custom Background States
  const [bgType, setBgType] = useState<"default" | "curated" | "upload" | "url">(DEFAULT_BG_SETTINGS.type);
  const [bgCuratedUrl, setBgCuratedUrl] = useState(DEFAULT_BG_SETTINGS.curatedUrl);
  const [bgUrlLink, setBgUrlLink] = useState(DEFAULT_BG_SETTINGS.urlLink);
  const [bgOpacity, setBgOpacity] = useState(DEFAULT_BG_SETTINGS.opacity);
  const [bgBlur, setBgBlur] = useState(DEFAULT_BG_SETTINGS.blur);
  const [bgDim, setBgDim] = useState(DEFAULT_BG_SETTINGS.dim);
  
  // Custom upload status
  const [hasUpload, setHasUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Mail Settings States
  const [showMailButton, setShowMailButton] = useState(true);
  const [mailService, setMailService] = useState<"gmail" | "outlook" | "yahoo" | "custom">("gmail");
  const [customMailUrl, setCustomMailUrl] = useState("");


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

  // Navigation state inside drawer
  const [activePane, setActivePane] = useState<"main" | "background">("main");
 
  const containerRef = useRef<HTMLDivElement>(null);
  const customColorBtnRef = useRef<HTMLButtonElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const bgPanelRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  // Fetch Picsum Photos
  useEffect(() => {
    if (picsumSubTab !== "gallery") return;
    let active = true;
    const fetchPhotos = async () => {
      setPicsumLoading(true);
      setPicsumError("");
      try {
        const res = await fetch(`https://picsum.photos/v2/list?page=${picsumPage}&limit=8`);
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
 
  // Initialize states on mount (avoid Next.js hydration mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getInitialTheme());
 
    const savedGlow = localStorage.getItem("slate-settings-glow") !== "false";
    const savedMinimal = localStorage.getItem("slate-settings-minimal") === "true";
    const savedPerf = localStorage.getItem("slate-settings-perf") === "true";
    const savedWeather = localStorage.getItem("slate-settings-weather") !== "false";
    const savedQuicklinks = localStorage.getItem("slate-settings-quicklinks") !== "false";
    const savedUsername = localStorage.getItem("slate-username") || "";
    const savedAccent = localStorage.getItem("slate-accent") || "sage";
    const savedCustom = localStorage.getItem("slate-custom-accent") || "#7ca38e";
    const savedCustomLight = localStorage.getItem("slate-accent-light") || "#4B6F58";
 
    const savedBgType = (localStorage.getItem("slate-bg-type") || DEFAULT_BG_SETTINGS.type) as typeof DEFAULT_BG_SETTINGS.type;
    const savedBgCuratedUrl = localStorage.getItem("slate-bg-curated-url") || DEFAULT_BG_SETTINGS.curatedUrl;
    const savedBgUrlLink = localStorage.getItem("slate-bg-url-link") || DEFAULT_BG_SETTINGS.urlLink;
    const savedBgOpacity = localStorage.getItem("slate-bg-opacity") ? parseInt(localStorage.getItem("slate-bg-opacity")!) : DEFAULT_BG_SETTINGS.opacity;
    const savedBgBlur = localStorage.getItem("slate-bg-blur") ? parseInt(localStorage.getItem("slate-bg-blur")!) : DEFAULT_BG_SETTINGS.blur;
    const savedBgDim = localStorage.getItem("slate-bg-dim") ? parseInt(localStorage.getItem("slate-bg-dim")!) : DEFAULT_BG_SETTINGS.dim;
 
    const savedShowMail = localStorage.getItem("slate-settings-show-mail") !== "false";
    const savedMailService = (localStorage.getItem("slate-mail-service") || "gmail") as "gmail" | "outlook" | "yahoo" | "custom";
    const savedCustomMailUrl = localStorage.getItem("slate-custom-mail-url") || "";

    setGlowEnabled(savedGlow);
    setMinimalLayout(savedMinimal);
    setPerformanceMode(savedPerf);
    setShowWeather(savedWeather);
    setTempUnit((localStorage.getItem("slate-temp-unit") || "celsius") as "celsius" | "fahrenheit");
    setShowQuicklinks(savedQuicklinks);
    setUsername(savedUsername);
    setAccentColor(savedAccent);
    setCustomColor(savedCustom);
    setCustomHsl(hexToHsl(savedCustom));
    setHexInputValue(savedCustom);
    
    setShowMailButton(savedShowMail);
    setMailService(savedMailService);
    setCustomMailUrl(savedCustomMailUrl);
 
    setBgType(savedBgType);
    setBgCuratedUrl(savedBgCuratedUrl);
    setBgUrlLink(savedBgUrlLink);
    setBgOpacity(savedBgOpacity);
    setBgBlur(savedBgBlur);
    setBgDim(savedBgDim);
 
    document.documentElement.setAttribute("data-glow", savedGlow ? "true" : "false");
    document.documentElement.setAttribute("data-minimal", savedMinimal ? "true" : "false");
    document.documentElement.setAttribute("data-perf", savedPerf ? "true" : "false");
    document.documentElement.setAttribute("data-accent", savedAccent);
    if (savedAccent === "custom") {
      document.documentElement.style.setProperty('--custom-accent', savedCustom);
      document.documentElement.style.setProperty('--custom-accent-light', savedCustomLight);
    }

    // Check if there is an uploaded image in IndexedDB
    getBackgroundBlob().then((blob) => {
      if (blob) {
        setHasUpload(true);
        setUploadPreview(URL.createObjectURL(blob));
      }
    });

    const handleTempUnitUpdate = () => {
      setTempUnit((localStorage.getItem("slate-temp-unit") || "celsius") as "celsius" | "fahrenheit");
    };
    const handleMailUpdate = () => {
      setShowMailButton(localStorage.getItem("slate-settings-show-mail") !== "false");
      setMailService((localStorage.getItem("slate-mail-service") || "gmail") as "gmail" | "outlook" | "yahoo" | "custom");
      setCustomMailUrl(localStorage.getItem("slate-custom-mail-url") || "");
    };
    window.addEventListener("slate-temp-unit-updated", handleTempUnitUpdate);
    window.addEventListener("slate-mail-updated", handleMailUpdate);
 
    setMounted(true);

    return () => {
      window.removeEventListener("slate-temp-unit-updated", handleTempUnitUpdate);
      window.removeEventListener("slate-mail-updated", handleMailUpdate);
    };
  }, []);
 
  // Update theme attributes globally
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("slate-theme", theme);
    window.dispatchEvent(new Event("slate-theme-updated"));
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

  const toggleWeather = (val: boolean) => {
    setShowWeather(val);
    localStorage.setItem("slate-settings-weather", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-weather-updated"));
  };

  const toggleTempUnit = (val: "celsius" | "fahrenheit") => {
    setTempUnit(val);
    localStorage.setItem("slate-temp-unit", val);
    window.dispatchEvent(new Event("slate-temp-unit-updated"));
  };
 
  const toggleQuicklinks = (val: boolean) => {
    setShowQuicklinks(val);
    localStorage.setItem("slate-settings-quicklinks", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-quicklinks-settings-updated"));
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    localStorage.setItem("slate-username", val);
    window.dispatchEvent(new Event("slate-username-updated"));
  };

  const toggleMailButton = (val: boolean) => {
    setShowMailButton(val);
    localStorage.setItem("slate-settings-show-mail", val ? "true" : "false");
    window.dispatchEvent(new Event("slate-mail-updated"));
  };

  const updateMailService = (val: "gmail" | "outlook" | "yahoo" | "custom") => {
    setMailService(val);
    localStorage.setItem("slate-mail-service", val);
    window.dispatchEvent(new Event("slate-mail-updated"));
  };

  const updateCustomMailUrl = (val: string) => {
    setCustomMailUrl(val);
    localStorage.setItem("slate-custom-mail-url", val);
    window.dispatchEvent(new Event("slate-mail-updated"));
  };

  const getMailUrl = () => {
    switch (mailService) {
      case "outlook":
        return "https://outlook.live.com";
      case "yahoo":
        return "https://mail.yahoo.com";
      case "custom":
        if (!customMailUrl) return "https://mail.google.com";
        if (/^(https?:\/\/|mailto:)/i.test(customMailUrl)) {
          return customMailUrl;
        }
        return `https://${customMailUrl}`;
      case "gmail":
      default:
        return "https://mail.google.com";
    }
  };

  const getMailServiceName = () => {
    switch (mailService) {
      case "outlook":
        return "Outlook Mail";
      case "yahoo":
        return "Yahoo Mail";
      case "custom":
        return "Mail";
      case "gmail":
      default:
        return "Gmail";
    }
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
      setShowCustomPicker(true);
    }
  };

  const handleHslInput = (key: "h" | "s" | "l", val: number) => {
    const newHsl = { ...customHsl, [key]: val };
    setCustomHsl(newHsl);

    const darkHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setCustomColor(darkHex);
    setHexInputValue(darkHex);

    const lightColor = getLightAccentColor(darkHex);

    setAccentColor("custom");
    document.documentElement.style.setProperty('--custom-accent', darkHex);
    document.documentElement.style.setProperty('--custom-accent-light', lightColor);
    document.documentElement.setAttribute("data-accent", "custom");

    if (customColorBtnRef.current) {
      const activeColor = theme === "light" ? lightColor : darkHex;
      customColorBtnRef.current.style.background = activeColor;
    }
  };

  const handleHslChange = (key: "h" | "s" | "l", val: number) => {
    const newHsl = { ...customHsl, [key]: val };
    setCustomHsl(newHsl);

    const darkHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setCustomColor(darkHex);
    setHexInputValue(darkHex);

    const lightColor = getLightAccentColor(darkHex);

    localStorage.setItem("slate-custom-accent", darkHex);
    localStorage.setItem("slate-accent-light", lightColor);
    
    setAccentColor("custom");
    localStorage.setItem("slate-accent", "custom");
    document.documentElement.setAttribute("data-accent", "custom");

    document.documentElement.style.setProperty('--custom-accent', darkHex);
    document.documentElement.style.setProperty('--custom-accent-light', lightColor);
  };

  const handleHexInputChange = (val: string) => {
    setHexInputValue(val);

    const hexRegex = /^#?([0-9A-F]{3}){1,2}$/i;
    let cleanHex = val.trim();
    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex;
    }

    if (hexRegex.test(cleanHex)) {
      if (cleanHex.length === 4 || cleanHex.length === 7) {
        setCustomColor(cleanHex);
        const hsl = hexToHsl(cleanHex);
        setCustomHsl(hsl);

        const lightColor = getLightAccentColor(cleanHex);
        localStorage.setItem("slate-custom-accent", cleanHex);
        localStorage.setItem("slate-accent-light", lightColor);

        setAccentColor("custom");
        localStorage.setItem("slate-accent", "custom");
        document.documentElement.setAttribute("data-accent", "custom");

        document.documentElement.style.setProperty('--custom-accent', cleanHex);
        document.documentElement.style.setProperty('--custom-accent-light', lightColor);

        if (customColorBtnRef.current) {
          const activeColor = theme === "light" ? lightColor : cleanHex;
          customColorBtnRef.current.style.background = activeColor;
        }
      }
    }
  };

  const notifyBgUpdate = () => {
    window.dispatchEvent(new Event("slate-background-updated"));
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

  // Reset drawer state and scroll positions when opened
  useEffect(() => {
    if (isDrawerOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivePane("main");
      
      const resetScroll = () => {
        if (mainPanelRef.current) {
          mainPanelRef.current.scrollTop = 0;
        }
        if (bgPanelRef.current) {
          bgPanelRef.current.scrollTop = 0;
        }
      };

      resetScroll();
      
      // Perform a secondary reset on the next frame to handle any pending rendering cycles
      const rafId = requestAnimationFrame(resetScroll);
      return () => cancelAnimationFrame(rafId);
    }
  }, [isDrawerOpen]);

  if (!mounted) {
    // Render an invisible placeholder during SSR to prevent layout shifting
    return (
      <div className="fixed top-6 right-6 sm:top-12 sm:right-12 w-[100px] h-[44px] rounded-full opacity-0" />
    );
  }

  const isDark = theme === "dark";
  const isCustomBgActive = bgType !== "default" && (
    (bgType === "curated" && bgCuratedUrl) ||
    (bgType === "url" && bgUrlLink) ||
    (bgType === "upload" && uploadPreview)
  );

  return (
    <div ref={containerRef} className="fixed top-6 right-6 sm:top-12 sm:right-12 z-50 flex flex-col items-end">
      
      {/* Unified Control Pill */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg backdrop-blur-xl transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--foreground)]/15">
        
        {/* Mail Button */}
        {showMailButton && (
          <>
            <a
              href={getMailUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2.5 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer"
              title={`Open ${getMailServiceName()}`}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Mail strokeWidth="2.25" className="w-[18px] h-[18px]" />
              </div>
            </a>
            {/* Hairline Divider */}
            <div className="w-[1px] h-4.5 bg-[var(--foreground)]/10" />
          </>
        )}

        {!isCustomBgActive && (
          <>
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
          </>
        )}

        {/* Hamburger Menu Toggle Button */}
        <button
          onClick={toggleDrawer}
          className="group relative p-2.5 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 hover:scale-105 active:scale-95 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
        >
          <div className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDrawerOpen ? "rotate-90" : "rotate-0"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path
                d={isDrawerOpen ? "M 5 5 L 19 19" : "M 4 6 L 20 6"}
                className={`origin-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
                className={`origin-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-[var(--glass-bg)] backdrop-blur-[30px] border-l border-[var(--glass-border)] z-40 overflow-hidden shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-95"
        }`}
        style={{ height: "100vh" }}
      >
        <div 
          className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: activePane === "background" ? "translateX(-50%)" : "translateX(0)" }}
        >
          {/* Main Panel */}
          <div ref={mainPanelRef} className="w-1/2 h-full p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
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
                
                {/* Personalized Name */}
                <div
                  style={{ animationDelay: "50ms" }}
                  className={`flex flex-col gap-2 py-2 border-b border-[var(--glass-border)]/40 ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--accent)]" /> Your Name
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Appends your name to the main greeting
                    </span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Enter name..."
                    maxLength={20}
                    className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                  />
                </div>

                {/* Weather Widget */}
                <div
                  style={{ animationDelay: "100ms" }}
                  className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <CloudSun className="w-4 h-4 text-[var(--accent)]" /> Weather Widget
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Show current weather in the corner
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWeather(!showWeather)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                      showWeather ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        showWeather ? "translate-x-5" : "translate-x-0"
                      } active:scale-x-125`}
                    />
                  </button>
                </div>

                {/* Temperature Unit */}
                {showWeather && (
                  <div
                    style={{ animationDelay: "120ms" }}
                    className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 animate-suggest-in ${
                      isDrawerOpen ? "animate-item-in" : "opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-[var(--accent)]" /> Temp Unit
                      </span>
                      <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                        Celsius (°C) vs Fahrenheit (°F)
                      </span>
                    </div>
                    <div className="flex gap-1 bg-[var(--foreground)]/5 border border-[var(--glass-border)]/30 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() => toggleTempUnit("celsius")}
                        className={`px-2 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                          tempUnit === "celsius"
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--foreground)]/65 hover:text-[var(--foreground)]"
                        }`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() => toggleTempUnit("fahrenheit")}
                        className={`px-2 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                          tempUnit === "fahrenheit"
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--foreground)]/65 hover:text-[var(--foreground)]"
                        }`}
                      >
                        °F
                      </button>
                    </div>
                  </div>
                )}

                {/* Mail Button Toggle */}
                <div
                  style={{ animationDelay: "140ms" }}
                  className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--accent)]" /> Mail Shortcut
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Show quick-access mail button in the top right
                    </span>
                  </div>
                  <button
                    onClick={() => toggleMailButton(!showMailButton)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                      showMailButton ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20 dark:bg-[var(--foreground)]/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[var(--background)] shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        showMailButton ? "translate-x-5" : "translate-x-0"
                      } active:scale-x-125`}
                    />
                  </button>
                </div>

                {/* Mail Service Selection */}
                {showMailButton && (
                  <div
                    style={{ animationDelay: "160ms" }}
                    className={`flex flex-col gap-2 py-2 border-b border-[var(--glass-border)]/40 animate-suggest-in ${
                      isDrawerOpen ? "animate-item-in" : "opacity-0"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70">
                          Mail Service
                        </span>
                        <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                          Choose your preferred provider
                        </span>
                      </div>
                      <div className="flex gap-1 bg-[var(--foreground)]/5 border border-[var(--glass-border)]/30 rounded-lg p-0.5 shrink-0">
                        {(["gmail", "outlook", "yahoo", "custom"] as const).map((service) => (
                          <button
                            key={service}
                            onClick={() => updateMailService(service)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer capitalize ${
                              mailService === service
                                ? "bg-[var(--accent)] text-black"
                                : "text-[var(--foreground)]/65 hover:text-[var(--foreground)]"
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom URL Input if Custom Selected */}
                    {mailService === "custom" && (
                      <input
                        type="text"
                        value={customMailUrl}
                        onChange={(e) => updateCustomMailUrl(e.target.value)}
                        placeholder="https://mail.proton.me"
                        className="w-full h-[38px] px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--foreground)]/8 transition-all duration-300"
                      />
                    )}
                  </div>
                )}

                {/* Quicklinks Toggle */}
                <div
                  style={{ animationDelay: "180ms" }}
                  className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-[var(--accent)]" /> Shortcuts Bar
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Show site shortcuts below the search bar
                    </span>
                  </div>
                  <button
                    onClick={() => toggleQuicklinks(!showQuicklinks)}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
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

                {/* Glow Toggle */}
                <div
                  style={{ animationDelay: "200ms" }}
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
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
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
                  style={{ animationDelay: "220ms" }}
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
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
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
                  style={{ animationDelay: "240ms" }}
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
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
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

                {/* Accent Color Selection */}
                <div
                  style={{ animationDelay: "260ms" }}
                  className={`flex flex-col gap-2.5 py-2 border-b border-[var(--glass-border)]/40 ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[var(--accent)]" /> Accent Color
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Choose a signature accent color preset
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleAccentChange(preset.id)}
                        title={preset.name}
                        className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-300 relative flex items-center justify-center border hover:scale-110 active:scale-95
                          ${accentColor === preset.id
                            ? "border-[var(--foreground)] scale-105 shadow-sm"
                            : "border-[var(--foreground)]/10"}`}
                        style={{ backgroundColor: theme === "light" ? preset.lightColor : preset.color }}
                      >
                        {accentColor === preset.id && (
                          <div className="w-2 h-2 rounded-full bg-[var(--background)]" />
                        )}
                      </button>
                    ))}

                    {/* Custom Color Button */}
                    <button
                      ref={customColorBtnRef}
                      onClick={() => handleAccentChange("custom")}
                      title="Custom Color"
                      className={`w-7 h-7 rounded-full cursor-pointer relative flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-95
                        ${accentColor === "custom"
                          ? "border-[var(--foreground)] scale-105 shadow-sm"
                          : "border-[var(--foreground)]/10"}`}
                      style={{
                        background: accentColor === "custom"
                          ? (theme === "light" ? getLightAccentColor(customColor) : customColor)
                          : "conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #7f00ff, #ff00ff, #ff0000)",
                      }}
                    >
                      {accentColor === "custom" ? (
                        <div className="w-2 h-2 rounded-full bg-[var(--background)]" />
                      ) : (
                        <span className="text-[10px] font-bold text-white shadow-sm drop-shadow-md">+</span>
                      )}
                    </button>

                    {/* Customize Toggle Button */}
                    {accentColor === "custom" && (
                      <button
                        onClick={() => setShowCustomPicker(prev => !prev)}
                        title="Tweak Custom Color"
                        className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center border transition-all duration-300 active:scale-95
                          ${showCustomPicker
                            ? "border-[var(--foreground)] bg-[var(--foreground)]/10 text-[var(--foreground)] shadow-sm"
                            : "border-[var(--glass-border)] bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/70"}`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {accentColor === "custom" && showCustomPicker && (
                    <div className="flex flex-col gap-3 p-3 mt-1.5 rounded-lg bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 animate-suggest-in">
                      {/* Hue Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-[var(--foreground)]/75">
                          <span>Hue</span>
                          <span>{customHsl.h}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={customHsl.h}
                          onInput={(e) => handleHslInput("h", parseInt((e.target as HTMLInputElement).value))}
                          onChange={(e) => handleHslChange("h", parseInt((e.target as HTMLInputElement).value))}
                          className="color-picker-slider w-full h-1.5 rounded-lg cursor-pointer"
                          style={{
                            background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                          }}
                        />
                      </div>

                      {/* Saturation Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-[var(--foreground)]/75">
                          <span>Saturation</span>
                          <span>{customHsl.s}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={customHsl.s}
                          onInput={(e) => handleHslInput("s", parseInt((e.target as HTMLInputElement).value))}
                          onChange={(e) => handleHslChange("s", parseInt((e.target as HTMLInputElement).value))}
                          className="color-picker-slider w-full h-1.5 rounded-lg cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, hsl(${customHsl.h}, 0%, ${customHsl.l}%), hsl(${customHsl.h}, 100%, ${customHsl.l}%))`,
                          }}
                        />
                      </div>

                      {/* Lightness Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-medium text-[var(--foreground)]/75">
                          <span>Lightness</span>
                          <span>{customHsl.l}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={customHsl.l}
                          onInput={(e) => handleHslInput("l", parseInt((e.target as HTMLInputElement).value))}
                          onChange={(e) => handleHslChange("l", parseInt((e.target as HTMLInputElement).value))}
                          className="color-picker-slider w-full h-1.5 rounded-lg cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #000000, hsl(${customHsl.h}, ${customHsl.s}%, 50%), #ffffff)`,
                          }}
                        />
                      </div>

                      {/* Hex Input */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-[var(--foreground)]/75">Hex Value</span>
                        <input
                          type="text"
                          value={hexInputValue}
                          onChange={(e) => handleHexInputChange(e.target.value)}
                          placeholder="#FFFFFF"
                          maxLength={7}
                          className="w-[76px] h-6 px-1.5 rounded bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-[11px] text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Selection Row */}
                <div
                  style={{ animationDelay: "300ms" }}
                  className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 cursor-pointer hover:bg-[var(--foreground)]/3 px-2 -mx-2 rounded-lg transition-colors ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                  onClick={() => setActivePane("background")}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[var(--accent)]" /> Background
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      {bgType === "default" && "Slate Gradient (Default)"}
                      {bgType === "curated" && "Curated & Web Gallery"}
                      {bgType === "upload" && "Custom Uploaded Photo"}
                      {bgType === "url" && "Custom Pasted Image Link"}
                    </span>
                  </div>
                  <div className="flex items-center text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                    <ChevronLeft className="w-4 h-4 rotate-180 text-[var(--accent)]" />
                  </div>
                </div>

                {/* Detailed Settings Page Row */}
                <Link
                  href={getSettingsUrl()}
                  style={{ animationDelay: "350ms" }}
                  className={`flex items-center justify-between py-2 border-b border-[var(--glass-border)]/40 cursor-pointer hover:bg-[var(--foreground)]/3 px-2 -mx-2 rounded-lg transition-colors ${
                    isDrawerOpen ? "animate-item-in" : "opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium sm:font-normal text-[var(--foreground)]/90 dark:text-[var(--foreground)]/70 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[var(--accent)]" /> Detailed Settings
                    </span>
                    <span className="text-[11px] text-[var(--foreground)]/65 dark:text-[var(--foreground)]/45 font-normal">
                      Configure search engines and advanced layouts
                    </span>
                  </div>
                  <div className="flex items-center text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                    <ChevronLeft className="w-4 h-4 rotate-180 text-[var(--accent)]" />
                  </div>
                </Link>

              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] tracking-widest text-[var(--foreground)]/48 dark:text-[var(--foreground)]/30 uppercase font-medium pt-6 border-t border-[var(--glass-border)]/40 mb-2">
              Slate Tabs v{siteConfig.version}
            </div>
          </div>

          {/* Background Settings Panel */}
          <div ref={bgPanelRef} className="w-1/2 h-full p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4 mt-2">
                <button
                  onClick={() => setActivePane("main")}
                  className="flex items-center gap-1 text-xs font-normal text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--accent)]" /> Back
                </button>
                <div className="flex flex-col items-end">
                  <h2 className="text-sm font-medium text-[var(--foreground)]">Background</h2>
                  <p className="text-[9px] tracking-wider text-[var(--foreground)]/40 uppercase font-medium mt-0.5">
                    Select & Adjust
                  </p>
                </div>
              </div>

              {/* Source Selector */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-[var(--foreground)]/80">Background Source</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBgTypeChange("default")}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                      bgType === "default"
                        ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-medium">Default Gradient</span>
                  </button>
                  <button
                    onClick={() => handleBgTypeChange("curated")}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                      bgType === "curated"
                        ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-medium">Presets & Gallery</span>
                  </button>
                  <button
                    onClick={() => handleBgTypeChange("upload")}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                      bgType === "upload"
                        ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-medium">Custom Upload</span>
                  </button>
                  <button
                    onClick={() => handleBgTypeChange("url")}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                      bgType === "url"
                        ? "bg-[var(--foreground)]/8 border-[var(--accent)] text-[var(--foreground)]"
                        : "bg-[var(--foreground)]/3 border-[var(--glass-border)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs font-medium">Pasted URL</span>
                  </button>
                </div>
              </div>

              {/* Conditional Source Content */}
              <div className="flex flex-col gap-4">
                {bgType === "default" && (
                  <div className="p-3.5 rounded-lg bg-[var(--foreground)]/3 border border-[var(--glass-border)]/40 text-[11px] leading-relaxed text-[var(--foreground)]/60">
                    {"Slate's default theme features a clean, responsive ambient breathing glow synchronized with your accent color preset."}
                  </div>
                )}

                {bgType === "curated" && (
                  <div className="flex flex-col gap-4">
                    {/* Sub Tab Switcher */}
                    <div className="flex gap-1.5 border-b border-[var(--glass-border)]/30 pb-2">
                      <button
                        type="button"
                        onClick={() => setPicsumSubTab("presets")}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                          picsumSubTab === "presets"
                            ? "bg-[var(--accent)] text-black"
                            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                        }`}
                      >
                        Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setPicsumSubTab("gallery")}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
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
                      <div className="flex flex-col gap-4 animate-suggest-in">
                        <div>
                          <span className="text-[11px] font-medium text-[var(--foreground)]/60">Curated Wallpapers</span>
                          <div className="grid grid-cols-4 gap-1.5 mt-2">
                            {CURATED_BACKGROUNDS.map((bg) => (
                              <button
                                key={bg.id}
                                onClick={() => handleBgCuratedSelect(bg.url, bg.photographer, bg.profileUrl)}
                                className={`aspect-square rounded-md overflow-hidden border transition-all duration-300 relative group cursor-pointer ${
                                  bgType === "curated" && bgCuratedUrl === bg.url
                                    ? "border-[var(--accent)] scale-95 shadow-md"
                                    : "border-transparent hover:scale-105"
                                }`}
                                title={`Photo by ${bg.photographer}`}
                              >
                                <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover animate-[fadeIn_0.5s_ease]" />
                                {bgType === "curated" && bgCuratedUrl === bg.url && (
                                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
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
                          <span className="text-[11px] font-medium text-[var(--foreground)]/60">Browse Web Photos (Lorem Picsum)</span>
                          <button
                            type="button"
                            onClick={handleRandomPicsum}
                            disabled={picsumLoading}
                            className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--accent)] border border-[var(--glass-border)]/50 text-[10px] font-medium flex items-center gap-1 transition-all duration-300 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3" /> Surprise
                          </button>
                        </div>

                        {picsumLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                          </div>
                        ) : picsumError ? (
                          <span className="text-[10px] text-red-400 font-medium">{picsumError}</span>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-4 gap-1.5 mt-1">
                              {picsumPhotos.map((photo) => {
                                const photoUrl = `https://picsum.photos/id/${photo.id}/1920/1080`;
                                const thumbUrl = `https://picsum.photos/id/${photo.id}/240/240`;
                                const isSelected = bgType === "curated" && bgCuratedUrl === photoUrl;
                                return (
                                  <button
                                    key={photo.id}
                                    onClick={() => handleBgCuratedSelect(photoUrl, photo.author, photo.url)}
                                    className={`aspect-square rounded-md overflow-hidden border transition-all duration-300 relative group cursor-pointer ${
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
                                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between border-t border-[var(--glass-border)]/40 pt-3 mt-1">
                              <button
                                type="button"
                                disabled={picsumPage <= 1}
                                onClick={() => setPicsumPage((p) => Math.max(1, p - 1))}
                                className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/45 text-[10px] font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-all duration-300"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" /> Prev
                              </button>
                              <span className="text-[10px] text-[var(--foreground)]/60 font-medium">Page {picsumPage}</span>
                              <button
                                type="button"
                                onClick={() => setPicsumPage((p) => p + 1)}
                                className="h-7 px-2.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)]/45 text-[10px] font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 cursor-pointer flex items-center gap-1 transition-all duration-300"
                              >
                                Next <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {bgType === "upload" && (
                  <div className="flex flex-col gap-3 mt-1">
                    {hasUpload && uploadPreview ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[var(--glass-border)] group">
                        <img src={uploadPreview} alt="Uploaded background" className="w-full h-full object-cover animate-[fadeIn_0.5s_ease]" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-350 gap-2">
                          <button
                            onClick={handleRemoveUpload}
                            className="p-2.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                            title="Delete custom upload"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video border border-dashed border-[var(--glass-border)] hover:border-[var(--accent)]/55 rounded-lg bg-[var(--foreground)]/3 hover:bg-[var(--foreground)]/5 transition-all duration-300 cursor-pointer text-center p-4">
                        <div className="flex flex-col items-center gap-2.5">
                          <Upload className="w-6 h-6 text-[var(--accent)]" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-[var(--foreground)]/80">Upload Background Image</span>
                            <span className="text-[9px] text-[var(--foreground)]/40 uppercase tracking-wide">Supports PNG, JPG, WEBP</span>
                          </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                )}

                {bgType === "url" && (
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-xs font-medium text-[var(--foreground)]/80">Direct Image URL</span>
                    <input
                      type="text"
                      value={bgUrlLink}
                      onChange={(e) => handleBgUrlChange(e.target.value)}
                      placeholder="Paste link (https://example.com/image.jpg)..."
                      className="w-full h-9 px-3.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Adjustments Sliders */}
              {bgType !== "default" && (
                <div className="flex flex-col gap-4 border-t border-[var(--glass-border)]/40 pt-4 mt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground)]/50">Adjustments</span>

                  {/* Opacity */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/80">
                      <span>Image Opacity</span>
                      <span>{bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={bgOpacity}
                      onChange={(e) => handleBgOpacityChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>

                  {/* Dim */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/80">
                      <span>Dim (Darken Overlay)</span>
                      <span>{bgDim}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={bgDim}
                      onChange={(e) => handleBgDimChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>

                  {/* Blur */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]/80">
                      <span>Blur Effect</span>
                      <span>{bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={bgBlur}
                      onChange={(e) => handleBgBlurChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--foreground)]/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="text-center text-[10px] tracking-widest text-[var(--foreground)]/48 dark:text-[var(--foreground)]/30 uppercase font-medium pt-6 border-t border-[var(--glass-border)]/40 mb-2">
              Slate Tabs v{siteConfig.version}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
