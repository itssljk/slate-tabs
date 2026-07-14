import SearchBar from "@/components/SearchBar";
import Greeting from "@/components/Greeting";
import ControlHub from "@/components/ControlHub";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-clip p-6 sm:p-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-400">
      {/* Ambient background glow */}
      <div className="absolute top-[35%] left-1/2 w-[300px] h-[300px] sm:w-[550px] sm:h-[550px] rounded-full bg-[var(--accent)]/10 dark:bg-[var(--accent)]/7 blur-[80px] sm:blur-[130px] pointer-events-none -z-10 animate-breathe" />

      <main className="flex flex-col items-center gap-10 flex-1 w-full max-w-4xl mx-auto pt-[18vh]">
        <Greeting />
        <SearchBar />
      </main>

      <footer className="w-full text-center pointer-events-none select-none flex flex-col gap-1 items-center">
        <span className="text-[10px] tracking-[0.3em] font-light text-[var(--foreground)]/60 dark:text-[var(--accent)]/70 uppercase">
          New Slate
        </span>
        <span className="text-[9px] tracking-[0.15em] font-light text-[var(--foreground)]/40 dark:text-[var(--accent)]/50 uppercase">
          © 2026 Slate Tabs
        </span>
      </footer>

      <ControlHub />
    </div>
  );
}
