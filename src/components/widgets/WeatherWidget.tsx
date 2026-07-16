"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
}

interface WeatherData {
  current: WeatherCurrent;
  location: string;
}

const WMO_CODES: Record<number, { description: string }> = {
  0: { description: "Clear" },
  1: { description: "Mostly Clear" },
  2: { description: "Partly Cloudy" },
  3: { description: "Overcast" },
  45: { description: "Fog" },
  48: { description: "Rime Fog" },
  51: { description: "Light Drizzle" },
  53: { description: "Drizzle" },
  55: { description: "Heavy Drizzle" },
  56: { description: "Freezing Drizzle" },
  57: { description: "Heavy Freezing Drizzle" },
  61: { description: "Light Rain" },
  63: { description: "Rain" },
  65: { description: "Heavy Rain" },
  66: { description: "Freezing Rain" },
  67: { description: "Heavy Freezing Rain" },
  71: { description: "Light Snow" },
  73: { description: "Snow" },
  75: { description: "Heavy Snow" },
  77: { description: "Snow Grains" },
  80: { description: "Rain Showers" },
  81: { description: "Heavy Rain Showers" },
  82: { description: "Violent Rain" },
  85: { description: "Snow Showers" },
  86: { description: "Heavy Snow Showers" },
  95: { description: "Thunderstorm" },
  96: { description: "Hail Thunderstorm" },
  99: { description: "Heavy Hail Storm" },
};

function WeatherIcon({ code, className, strokeWidth }: { code: number; className?: string; strokeWidth?: number }) {
  const props = { className, strokeWidth };
  if (code === 0 || code === 1) return <Sun {...props} />;
  if (code === 2) return <CloudSun {...props} />;
  if (code === 3) return <Cloud {...props} />;
  if (code >= 45 && code <= 48) return <CloudFog {...props} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle {...props} />;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain {...props} />;
  if (code >= 71 && code <= 77) return <CloudSnow {...props} />;
  if (code >= 85 && code <= 86) return <CloudSnow {...props} />;
  if (code >= 95 && code <= 99) return <CloudLightning {...props} />;
  return <Cloud {...props} />;
}

function getDescription(code: number): string {
  return WMO_CODES[code]?.description ?? "Unknown";
}

function getLocationName(lat: number, lon: number): Promise<string> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=10`,
    { headers: { "Accept-Language": navigator.language } }
  )
    .then((r) => r.json())
    .then((data) => {
      if (data?.address) {
        const a = data.address;
        return a.city || a.town || a.village || a.municipality || a.county || a.state || a.country || "";
      }
      return "";
    })
    .catch(() => "");
}

export default function WeatherWidget() {
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("slate-settings-weather") !== "false";
  });
  const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">(() => {
    if (typeof window === "undefined") return "celsius";
    return (localStorage.getItem("slate-temp-unit") || "celsius") as "celsius" | "fahrenheit";
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const weatherRef = useRef<WeatherData | null>(null);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  const loadWeather = useCallback(async () => {
    try {
      if (!navigator.geolocation) return;

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 600000,
        });
      });

      const { latitude, longitude } = position.coords;
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: "temperature_2m,weather_code",
        timezone: "auto",
      });

      const [weatherRes, location] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`).then((r) => r.json()),
        getLocationName(latitude, longitude),
      ]);

      setWeather({
        current: {
          temperature: Math.round(weatherRes.current.temperature_2m),
          weatherCode: weatherRes.current.weather_code,
        },
        location,
      });
    } catch {
      // silently fail — weather is non-essential
    }
  }, []);

  useEffect(() => {
    const savedEnabled = localStorage.getItem("slate-settings-weather") !== "false";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedEnabled) loadWeather();
    setLoaded(true);

    const handleUpdate = () => {
      const newEnabled = localStorage.getItem("slate-settings-weather") !== "false";
      setEnabled(newEnabled);
      if (newEnabled && !weatherRef.current) loadWeather();
    };

    const handleTempUnitUpdate = () => {
      setTempUnit((localStorage.getItem("slate-temp-unit") || "celsius") as "celsius" | "fahrenheit");
    };

    window.addEventListener("slate-weather-updated", handleUpdate);
    window.addEventListener("slate-temp-unit-updated", handleTempUnitUpdate);
    return () => {
      window.removeEventListener("slate-weather-updated", handleUpdate);
      window.removeEventListener("slate-temp-unit-updated", handleTempUnitUpdate);
    };
  }, [loadWeather]);

  if (!loaded) return null;
  if (!enabled) return null;
  if (!weather) return null;

  const displayTemp = tempUnit === "fahrenheit"
    ? Math.round((weather.current.temperature * 9) / 5 + 32)
    : weather.current.temperature;

  return (
    <div className="fixed top-0 left-0 z-40 p-6 sm:p-12 select-none pointer-events-none">
      <div className="animate-fade-in-up flex items-center gap-1.5 text-[var(--foreground)]/50 text-[13px] font-light tracking-wide">
        <WeatherIcon code={weather.current.weatherCode} className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span className="tabular-nums">
          {displayTemp}°{tempUnit === "fahrenheit" ? "F" : "C"}
        </span>
        <span className="hidden sm:inline">
          {getDescription(weather.current.weatherCode)}
        </span>
        {weather.location && (
          <span className="hidden md:inline text-[var(--foreground)]/30">
            &middot; {weather.location}
          </span>
        )}
      </div>
    </div>
  );
}
