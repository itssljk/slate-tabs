import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", href, external, ...props }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium tracking-tight rounded-sm transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
      // Variants
      {
        "bg-foreground text-background hover:opacity-90": variant === "primary",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        "border border-border bg-background text-foreground hover:bg-secondary/50 focus-visible:focus-ring": variant === "outline",
        "text-foreground hover:bg-secondary/40": variant === "ghost",
      },
      // Sizes
      {
        "px-2.5 py-1 text-xs": size === "sm",
        "px-4 py-1.5 text-sm": size === "md",
        "px-6 py-2 text-base": size === "lg",
      },
      className
    );

    if (href) {
      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseStyles}
            {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          />
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseStyles}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        />
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={baseStyles}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
