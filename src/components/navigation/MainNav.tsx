"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useTheme } from "@/components/core/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { Sun, Moon } from "lucide-react";

export function MainNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-mono text-sm font-bold tracking-widest uppercase">
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          <nav className="hidden items-center space-x-4 md:flex">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${
                  item.disabled ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 px-0"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
