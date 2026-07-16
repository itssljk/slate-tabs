"use client";

import { useEffect, useState } from "react";

interface GreetingData {
  text: string;
  subtext: string;
}

function getGreetingData(): GreetingData {
  const hour = new Date().getHours();
  if (hour < 4 || hour >= 22) {
    return {
      text: "Good night",
      subtext: "Rest well and sweet dreams",
    };
  }
  if (hour < 12) {
    return {
      text: "Good morning",
      subtext: "Embrace the fresh start of today",
    };
  }
  if (hour < 17) {
    return {
      text: "Good afternoon",
      subtext: "Keep up the great momentum",
    };
  }
  return {
    text: "Good evening",
    subtext: "Time to wind down and relax",
  };
}

export default function Greeting() {
  const [data, setData] = useState<GreetingData | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(getGreetingData());

    const savedUsername = localStorage.getItem("slate-username") || "";
    setUsername(savedUsername);

    const handleUsernameUpdate = () => {
      const currentUsername = localStorage.getItem("slate-username") || "";
      setUsername(currentUsername);
    };

    window.addEventListener("slate-username-updated", handleUsernameUpdate);
    return () => {
      window.removeEventListener("slate-username-updated", handleUsernameUpdate);
    };
  }, []);

  if (!data) return <div className="h-[68px] sm:h-[84px] lg:h-[96px]" />; // skeleton container to prevent layout shift

  return (
    <div className="flex flex-col items-center text-center select-none animate-fade-in-up">
      <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight greeting-gradient">
          {data.text}
          {username ? `, ${username}` : ""}
        </h1>
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--accent)] inline-block align-middle translate-y-[-2px] sm:translate-y-[-4px]" />
      </div>
      <p className="mt-3 text-xs sm:text-sm tracking-[0.2em] font-light text-[var(--foreground)]/50 uppercase text-readable">
        {data.subtext}
      </p>
    </div>
  );
}

