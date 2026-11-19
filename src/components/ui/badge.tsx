import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "mint" | "peach" | "accent" | "caution" | "cyan" | "pink" | "alert" | "ok" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border border-border text-text-muted bg-canvas font-semibold",
    mint: "border border-primary/40 text-emerald-800 bg-primary/20 font-bold",
    peach: "border border-secondary/50 text-amber-900 bg-secondary/30 font-bold",
    accent: "border border-accent/40 text-accent bg-accent/10 font-bold",
    caution: "border border-secondary/50 text-amber-900 bg-secondary/30 font-bold",
    cyan: "border border-primary/40 text-emerald-800 bg-primary/20 font-bold",
    pink: "border border-pink-300 text-pink-700 bg-pink-50 font-bold",
    alert: "border border-destructive/40 text-destructive bg-destructive/10 font-bold",
    ok: "border border-success/40 text-success bg-success/10 font-bold",
    outline: "border-2 border-border text-text bg-surface font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-body tracking-wide rounded-full select-none shadow-2xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
