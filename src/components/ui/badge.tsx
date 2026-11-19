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
    default: "border-fluor/20 text-fluor/80 bg-fluor/[0.04]",
    caution: "border-caution/30 text-caution bg-caution/10 font-semibold",
    cyan: "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10 font-semibold",
    pink: "border-neon-pink/30 text-neon-pink bg-neon-pink/10 font-semibold",
    alert: "border-alert/30 text-alert bg-alert/10 font-semibold",
    ok: "border-ok/30 text-ok bg-ok/10 font-semibold",
    outline: "border-fluor/25 text-fluor bg-transparent",
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
