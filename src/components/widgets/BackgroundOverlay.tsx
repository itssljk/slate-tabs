"use client";

import { useEffect, useState, useRef } from "react";
import { getBackgroundBlob, DEFAULT_BG_SETTINGS } from "@/utils/backgroundDb";

interface Credits {
  name: string;
  url: string;
}

export default function BackgroundOverlay() {
  const [mounted, setMounted] = useState(false);
  const [bgType, setBgType] = useState<string>("default");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [opacity, setOpacity] = useState<number>(50);
  const [blur, setBlur] = useState<number>(0);
  const [dim, setDim] = useState<number>(40);
  const [credits, setCredits] = useState<Credits | null>(null);

  const objectUrlRef = useRef<string>("");

  const loadSettings = async () => {
    if (typeof window === "undefined") return;

    const type = localStorage.getItem("slate-bg-type") || DEFAULT_BG_SETTINGS.type;
    const savedOpacity = localStorage.getItem("slate-bg-opacity")
      ? parseInt(localStorage.getItem("slate-bg-opacity")!)
      : DEFAULT_BG_SETTINGS.opacity;
    const savedBlur = localStorage.getItem("slate-bg-blur")
      ? parseInt(localStorage.getItem("slate-bg-blur")!)
      : DEFAULT_BG_SETTINGS.blur;
    const savedDim = localStorage.getItem("slate-bg-dim")
      ? parseInt(localStorage.getItem("slate-bg-dim")!)
      : DEFAULT_BG_SETTINGS.dim;
    setBgType(type);
    setOpacity(savedOpacity);
    setBlur(savedBlur);
    setDim(savedDim);

    // Clean up old object URL if any to prevent memory leaks
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    let url = "";
    let creditsData: Credits | null = null;

    if (type === "curated") {
      url = localStorage.getItem("slate-bg-curated-url") || "";
      const savedCredits = localStorage.getItem("slate-bg-curated-credits");
      if (savedCredits) {
        try {
          creditsData = JSON.parse(savedCredits);
        } catch {
          creditsData = null;
        }
      }
    } else if (type === "url") {
      url = localStorage.getItem("slate-bg-url-link") || "";
    } else if (type === "upload") {
      const blob = await getBackgroundBlob();
      if (blob) {
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        url = objUrl;
      }
    }

    setImageUrl(url);
    setCredits(creditsData);

    if (type !== "default" && url) {
      document.documentElement.dataset.bgCustom = "true";
    } else {
      delete document.documentElement.dataset.bgCustom;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
    setMounted(true);

    const handleUpdate = () => {
      loadSettings();
    };

    window.addEventListener("slate-background-updated", handleUpdate);
    window.addEventListener("slate-theme-updated", handleUpdate);
    return () => {
      window.removeEventListener("slate-background-updated", handleUpdate);
      window.removeEventListener("slate-theme-updated", handleUpdate);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  if (!mounted || bgType === "default" || !imageUrl) return null;

  return (
    <>
      {/* Base Dark Underlay (ensures image blends with dark even in light mode) */}
      <div className="fixed inset-0 pointer-events-none -z-21 bg-[#030307]" />

      {/* Background Image Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url("${imageUrl}")`,
          opacity: opacity / 100,
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          transform: blur > 0 ? "scale(1.03)" : "none",
        }}
      />
      {/* Dim Overlay Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-19 bg-[#030307] transition-all duration-500 ease-out"
        style={{
          opacity: dim / 100,
        }}
      />
      {/* Ambient Vignette Scrim (protects footer/header links) */}
      <div 
        className="fixed inset-0 pointer-events-none -z-18 transition-all duration-500 ease-out bg-[radial-gradient(circle_at_center,transparent_30%,rgba(3,3,7,0.3)_70%,rgba(3,3,7,0.65)_100%)]"
        style={{
          opacity: opacity > 0 ? 1 : 0,
        }}
      />
      {/* Photographer Credits in Bottom Left */}
      {credits && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 pointer-events-auto animate-fade-in-up">
          <a
            href={`${credits.url}?utm_source=slate_tabs&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#030307]/35 hover:bg-[#030307]/55 backdrop-blur-md border border-white/5 text-[9px] tracking-wider uppercase font-medium text-white/70 hover:text-white transition-all duration-300 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ca38e]" />
            Photo by {credits.name} on Unsplash
          </a>
        </div>
      )}
    </>
  );
}
