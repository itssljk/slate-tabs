"use client";

import Link from "next/link";
import { ChevronLeft, Scale, Shield, AlertTriangle } from "lucide-react";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import { siteConfig } from "@/config/site";

export default function TermsPage() {
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
            <h1 className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]">Terms of Service</h1>
            <p className="text-[10px] tracking-wider text-[var(--foreground)]/45 uppercase font-medium mt-0.5">
              Legal agreements for Slate Tabs users
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
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[var(--foreground)]/90">Open Source Terms</span>
            <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">
              Slate Tabs is a free and open-source project. By using the start page, you agree to these terms. If you do not agree, please do not use the application.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6 text-sm text-[var(--foreground)]/80 leading-relaxed">
          
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent)]" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Slate Tabs (the &quot;Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and the Slate Tabs contributors.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">2. Description of Service</h2>
            <p>
              Slate Tabs is a client-side browser start page dashboard that allows customization of theme colors, shortcut quicklinks, search engine routing, greetings, and weather widgets. The service is provided entirely in your browser without user accounts or server-side database storage.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">3. User Customization & Content</h2>
            <p>
              You own all customizations, shortcuts, background images, and settings configured on your dashboard. This configuration data is stored locally in your browser. You are responsible for ensuring that any URLs, custom shortcut titles, or uploaded background images comply with applicable laws and intellectual property rights.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--accent)]" /> 4. Disclaimers & Warranties
            </h2>
            <p className="uppercase text-xs font-semibold tracking-wider text-[var(--foreground)]/70">
              The service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;, without warranty of any kind.
            </p>
            <p>
              To the maximum extent permitted by law, the authors and contributors of Slate Tabs disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the service will be uninterrupted, error-free, or entirely secure.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">5. Limitation of Liability</h2>
            <p>
              In no event shall the authors, contributors, or copyright holders of Slate Tabs be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">6. Licensing & Open Source</h2>
            <p>
              Slate Tabs is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0), subject to the branding and trademark exceptions specified in the project repository&apos;s LICENSE file. You are free to share and adapt the codebase for non-commercial purposes, provided you offer attribution and distribute derivatives under the same license terms.
            </p>
          </section>

          <section className="flex flex-col gap-2 border-t border-[var(--glass-border)]/40 pt-4 mt-2">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Questions or Feedback</h2>
            <p>
              If you have any questions about these Terms of Service or want to contribute to the project development, please visit our{" "}
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
              >
                GitHub Repository
              </a>{" "}
              or join our community on{" "}
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
          <Link href="/tos" className="text-[var(--accent)] font-normal">Terms of Service</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
