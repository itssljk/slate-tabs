import React from "react";
import { Shell } from "@/components/core/Shell";
import { MainNav } from "@/components/navigation/MainNav";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Search, Plus, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <Shell>
      <MainNav />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 md:py-24">
        {/* Greetings Section */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl font-light tracking-tight sm:text-5xl uppercase font-sans">
            Slate
          </h1>
          <p className="text-sm font-mono tracking-widest text-muted-foreground uppercase">
            A clean slate for your thoughts
          </p>
        </div>

        {/* Minimal Search Bar Widget */}
        <form className="relative w-full max-w-md mb-12" action="https://www.google.com/search" method="get">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              name="q"
              placeholder="Search..."
              autoFocus
              className="pl-9 h-11 bg-background"
            />
          </div>
        </form>

        {/* Quicklinks and Extension Boundaries */}
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card Boundary 1: Tabs / Quick Links */}
          <Card className="flex flex-col justify-between h-40">
            <div>
              <h2 className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">
                Quick Links
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" href="https://github.com" external className="flex items-center space-x-1.5">
                  <span>GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </Button>
                <Button variant="outline" size="sm" href="https://gmail.com" external className="flex items-center space-x-1.5">
                  <span>Mail</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-fit self-start text-xs font-mono uppercase tracking-wider text-muted-foreground px-0">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Link
            </Button>
          </Card>

          {/* Card Boundary 2: Workspace Notes */}
          <Card className="flex flex-col justify-between h-40">
            <div>
              <h2 className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2">
                Workspace
              </h2>
              <p className="text-xs font-sans text-muted-foreground leading-relaxed pt-1">
                This is a clean state. Double-click here or configure your settings to connect modules.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-fit self-start text-xs font-mono uppercase tracking-wider text-muted-foreground px-0">
              Configure
            </Button>
          </Card>
        </div>
      </main>

      {/* Pristine Minimal Footer */}
      <footer className="w-full border-t border-border bg-background py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
            © 2026 Slate Tabs
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/itssljk/slate-tabs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono tracking-wider text-muted-foreground hover:text-foreground uppercase transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </Shell>
  );
}
