"use client";

import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, EyeOff, ExternalLink } from "lucide-react";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import { siteConfig } from "@/config/site";

export default function PrivacyPage() {
  return (
    <div className="relative isolate min-h-screen w-full flex flex-col p-4 sm:p-8 md:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      <BackgroundOverlay />

      {/* Ambient background glow */}
      <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/6 blur-[90px] sm:blur-[140px] pointer-events-none -z-10 animate-breathe" />

      {/* Header Bar */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between pb-6 border-b border-[var(--glass-border)]/60 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-[var(--foreground)]/5 border border-[var(--glass-border)] text-[var(--foreground)]/60 hover:text-[var(--foreground)]/10 active:scale-95 transition-all duration-300 cursor-pointer"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--accent)]" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]">Privacy Policy</h1>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              How Slate Tabs handles your information
            </p>
          </div>
        </div>
        <span className="text-[10px] tracking-[0.2em] font-light text-[var(--foreground)]/40 dark:text-[var(--accent)]/55 uppercase select-none">
          v{siteConfig.version}
        </span>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-3xl mx-auto flex-1 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-8 relative min-h-[450px]">
        
        {/* Intro Banner */}
        <div className="p-4 rounded-xl border border-[var(--glass-border)]/50 bg-[var(--foreground)]/[0.01] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[var(--foreground)]/90">Zero Tracking Policy</span>
            <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">
              Slate Tabs is built with privacy as our core tenet. We do not run background trackers, we do not run analytical software, and we do not collect, monetize, or share your personal data.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6 text-sm text-[var(--foreground)]/80 leading-relaxed">
          
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[var(--accent)]" /> 1. Data Collection
            </h2>
            <p>
              We do not collect any personal information, location tracking, or browsing history. Any queries entered into the Search Bar are passed directly to the search provider of your choice (e.g. Google, DuckDuckGo, Brave) and are not logged or stored by Slate Tabs.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent)]" /> 2. Local Storage
            </h2>
            <p>
              All configurations, customization settings, and shortcuts are stored exclusively inside your browser&apos;s local memory via <code>localStorage</code> and <code>IndexedDB</code>. This data never leaves your computer, and we have no access to it. Clearing your browser&apos;s site data or cache will restore Slate Tabs to its default state.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[var(--accent)]" /> 3. Third-Party Integrations
            </h2>
            <p>
              Slate Tabs connects to external services to provide convenient features:
            </p>
            <ul className="list-disc pl-5 mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/70">
              <li>
                <strong>Weather Forecasts</strong>: Weather data queries are executed client-side. The service retrieves forecasts without correlating them to personal user accounts.
              </li>
              <li>
                <strong>Favicon Lookups</strong>: Shortcut favicons are fetched directly via public domain favicon APIs.
              </li>
              <li>
                <strong>Search Providers</strong>: When using the search bar, your query is sent to your selected provider, governed by their respective privacy terms.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">4. Security</h2>
            <p>
              Because your configuration settings are stored locally on your device, the security of your settings is dependent on the security of your browser and local operating system user profile. We recommend keeping your web browser updated.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">5. Changes to This Policy</h2>
            <p>
              We reserve the right to update this privacy policy when needed. Any changes will be updated directly in the open-source repository and reflected in newer app versions.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[var(--glass-border)]/40 pt-4 mt-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Contact & Support</h2>
            <p>
              For privacy concerns, questions, or auditing our open-source codebase, please visit our{" "}
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
              >
                GitHub Repository
              </a>{" "}
              or join the conversation on our{" "}
              <a
                href={siteConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
              >
                Discord Server
              </a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="w-full max-w-3xl mx-auto pt-8 pb-4 flex justify-between border-t border-[var(--glass-border)]/20 mt-8 select-none" suppressHydrationWarning>
        <span className="text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <div className="flex gap-4 text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 uppercase">
          <Link href="/tos" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="text-[var(--accent)] font-normal">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
