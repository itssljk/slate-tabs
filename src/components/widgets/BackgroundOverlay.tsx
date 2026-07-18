"use client";

import { useEffect, useState, useRef } from "react";
import { getBackgroundBlob, DEFAULT_BG_SETTINGS } from "@/utils/backgroundDb";
import { safeLocalStorage } from "@/utils/safeStorage";

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
  const isMountedRef = useRef<boolean>(true);
  const requestCounterRef = useRef<number>(0);

  const loadSettings = async () => {
    if (typeof window === "undefined") return;

    const currentRequestId = ++requestCounterRef.current;

    const type = safeLocalStorage.getItem("slate-bg-type") || DEFAULT_BG_SETTINGS.type;
    
    // Parse settings safely guarding against NaN
    const rawOpacity = safeLocalStorage.getItem("slate-bg-opacity");
    const parsedOpacity = rawOpacity ? parseInt(rawOpacity) : NaN;
    const savedOpacity = isNaN(parsedOpacity) ? DEFAULT_BG_SETTINGS.opacity : parsedOpacity;

    const rawBlur = safeLocalStorage.getItem("slate-bg-blur");
    const parsedBlur = rawBlur ? parseInt(rawBlur) : NaN;
    const savedBlur = isNaN(parsedBlur) ? DEFAULT_BG_SETTINGS.blur : parsedBlur;

    const rawDim = safeLocalStorage.getItem("slate-bg-dim");
    const parsedDim = rawDim ? parseInt(rawDim) : NaN;
    const savedDim = isNaN(parsedDim) ? DEFAULT_BG_SETTINGS.dim : parsedDim;

    if (isMountedRef.current) {
      setBgType(type);
      setOpacity(savedOpacity);
      setBlur(savedBlur);
      setDim(savedDim);
    }

    // Clean up old object URL immediately if we are switching away from upload type
    if (type !== "upload" && objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    let url = "";
    let creditsData: Credits | null = null;

    if (type === "curated") {
      url = safeLocalStorage.getItem("slate-bg-curated-url") || "";
      const savedCredits = safeLocalStorage.getItem("slate-bg-curated-credits");
      if (savedCredits) {
        try {
          creditsData = JSON.parse(savedCredits);
        } catch {
          creditsData = null;
        }
      }
    } else if (type === "url") {
      url = safeLocalStorage.getItem("slate-bg-url-link") || "";
    } else if (type === "upload") {
      const blob = await getBackgroundBlob();
      
      // Ensure request is still current and component is still mounted
      if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) {
        return;
      }

      if (blob) {
        const oldUrl = objectUrlRef.current;
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        url = objUrl;
        
        // Revoke the old object URL only after creating the new one to prevent visual flicker
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
      }
    }

    if (currentRequestId !== requestCounterRef.current || !isMountedRef.current) {
      return;
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
    isMountedRef.current = true;
    loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleUpdate = () => {
      loadSettings();
    };

    window.addEventListener("slate-background-updated", handleUpdate);
    window.addEventListener("slate-theme-updated", handleUpdate);
    return () => {
      isMountedRef.current = false;
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#030307]/60 hover:bg-[#030307]/80 backdrop-blur-md border border-white/10 text-[9px] tracking-wider uppercase font-medium text-white hover:text-[var(--accent)] transition-all duration-300 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ca38e]" />
            Photo by {credits.name} on Unsplash
          </a>
        </div>
      )}
    </>
  );
}
