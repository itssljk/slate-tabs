import React from "react";
import { cn } from "@/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-sm border border-border bg-card text-card-foreground shadow-sm p-5",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
