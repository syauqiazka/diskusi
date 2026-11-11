import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "caution" | "cyan" | "pink" | "alert" | "ok" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-fluor/30 text-fluor/80 bg-fluor/5",
    caution: "border-caution/50 text-caution bg-caution/10",
    cyan: "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10",
    pink: "border-neon-pink/50 text-neon-pink bg-neon-pink/10",
    alert: "border-alert/50 text-alert bg-alert/10",
    ok: "border-ok/50 text-ok bg-ok/10",
    outline: "border-fluor/40 text-fluor bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider border font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
