"use client";

import { cn } from "../lib/utils";

export type StatusDotVariant = "success" | "fail" | "inGame";

const variantStyles: Record<
  StatusDotVariant,
  { ring: string; dot: string; pulse?: boolean }
> = {
  success: { ring: "bg-green/20", dot: "bg-green" },
  fail: { ring: "bg-destructive/30", dot: "bg-destructive" },
  inGame: { ring: "bg-primary/20", dot: "bg-primary", pulse: true },
};

interface StatusDotProps {
  variant: StatusDotVariant;
  className?: string;
}

export default function StatusDot({ variant, className }: StatusDotProps) {
  const { ring, dot, pulse } = variantStyles[variant];
  return (
    <div
      className={cn(
        "h-2.5 w-2.5 flex-shrink-0 rounded-full flex items-center justify-center",
        ring,
        className
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", dot, pulse && "animate-pulse")} />
    </div>
  );
}
