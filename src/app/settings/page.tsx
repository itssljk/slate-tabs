"use client";

import React from "react";
import { Shell } from "@/components/core/Shell";
import { MainNav } from "@/components/navigation/MainNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/core/ThemeProvider";
import { Settings as SettingsIcon, Sliders, Moon, Sun, Info } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Shell>
      <MainNav />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16 sm:px-6 md:py-24">
        {/* Settings Header */}
        <div className="flex items-center space-x-3 mb-8">
          <SettingsIcon className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-light tracking-tight uppercase font-sans">
            Settings
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Settings Panel */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h2 className="flex items-center space-x-2 text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
                <Sliders className="h-3.5 w-3.5" />
                <span>Appearance</span>
              </h2>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="space-y-0.5">
                  <span className="text-sm font-sans">Dark Mode</span>
                  <p className="text-xs text-muted-foreground">Toggle the interface color theme.</p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="flex items-center space-x-1.5">
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      <span>Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      <span>Dark Theme</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">
                System Info
              </h2>
              <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                Slate Tabs Version: <span className="font-mono text-foreground font-semibold">1.0.0</span>
              </p>
            </Card>
          </div>

          {/* Sidebar / Description */}
          <div className="space-y-6">
            <Card className="bg-secondary/20">
              <h3 className="flex items-center space-x-2 text-xs font-mono tracking-widest text-foreground uppercase mb-3">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span>About v1.0.0</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is a highly modular, clean-state scaffolding for your browser start page. It is structured with a local-first layout. Custom widgets can be easily dropped into the modules directory structure.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </Shell>
  );
}
