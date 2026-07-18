import SearchBar from "@/components/widgets/SearchBar";
import Greeting from "@/components/widgets/Greeting";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import ControlHub from "@/components/widgets/ControlHub";
import BackgroundOverlay from "@/components/widgets/BackgroundOverlay";
import Quicklinks from "@/components/widgets/Quicklinks";
import { ErrorBoundary } from "@/components/core/ErrorBoundary";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <ErrorBoundary>
    <div className="relative isolate min-h-screen w-full flex flex-col justify-between overflow-x-clip p-6 sm:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      <BackgroundOverlay />
      {/* Ambient background glow */}
      <div className="absolute top-[35%] left-1/2 w-[300px] h-[300px] sm:w-[550px] sm:h-[550px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/7 blur-[80px] sm:blur-[130px] pointer-events-none -z-10 animate-breathe" />

      <main className="flex flex-col items-center gap-10 flex-1 w-full max-w-4xl mx-auto pt-[18vh]">
        <Greeting />
        <SearchBar />
        <Quicklinks />
      </main>

      <footer className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 pointer-events-none select-none flex flex-col gap-1 items-end animate-fade-in-up">
        <span className="text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 dark:text-[var(--accent)]/50 uppercase text-readable" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
      </footer>

      <WeatherWidget />
      <ControlHub />
    </div>
    </ErrorBoundary>
  );
}
