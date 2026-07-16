import React from "react";
import { cn } from "@/utils/cn";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col bg-background text-foreground transition-colors duration-300 isolate",
        className
      )}
      {...props}
    >
      {/* Sleek subtle background grids or accent line, keeping it minimalist */}
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.005)_1px,transparent_1px)]" />
      {children}
    </div>
  );
}
