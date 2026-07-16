export interface AccentPreset {
  id: string;
  name: string;
  color: string;
  lightColor: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "sage", name: "Sage", color: "#7ca38e", lightColor: "#4B6F58" },
  { id: "emerald", name: "Emerald", color: "#10B981", lightColor: "#0A8057" },
  { id: "violet", name: "Violet", color: "#A78BFA", lightColor: "#6C3FE6" },
  { id: "amber", name: "Amber", color: "#FBBF24", lightColor: "#B25E00" },
  { id: "rose", name: "Rose", color: "#FB7185", lightColor: "#C82B54" },
  { id: "cyan", name: "Cyan", color: "#22D3EE", lightColor: "#067A92" },
  { id: "slate", name: "Slate", color: "#94A3B8", lightColor: "#50617A" }
];

export function getLightAccentColor(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    return hex;
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  const adjustedL = Math.max(25, Math.min(l - 22, 50));

  const sRatio = s / 100;
  const lRatio = adjustedL / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sRatio * Math.min(lRatio, 1 - lRatio);
  const f = (n: number) => {
    const k_n = k(n);
    const color = lRatio - a * Math.max(Math.min(k_n - 3, 9 - k_n, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    return { h: 0, s: 0, l: 0 };
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k_n = k(n);
    const color = l - a * Math.max(Math.min(k_n - 3, 9 - k_n, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
