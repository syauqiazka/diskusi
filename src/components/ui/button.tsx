import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "ghost" | "mint" | "peach";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-body text-sm font-bold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none rounded-2xl";

    const variantStyles = {
      default:
        "bg-accent text-white border-b-4 border-indigo-900 hover:bg-accent/95 hover:brightness-105 active:translate-y-[2px] active:border-b-2 shadow-sm font-display tracking-wider",
      mint:
        "bg-primary text-text border-b-4 border-emerald-600 hover:bg-primary/95 active:translate-y-[2px] active:border-b-2 shadow-sm",
      peach:
        "bg-secondary text-text border-b-4 border-amber-600 hover:bg-secondary/95 active:translate-y-[2px] active:border-b-2 shadow-sm",
      secondary:
        "bg-surface text-text border-2 border-border border-b-4 hover:border-primary/50 hover:bg-canvas active:translate-y-[2px] active:border-b-2 shadow-sm",
      outline:
        "bg-surface/80 text-text border-2 border-border hover:border-accent hover:text-accent active:translate-y-[1px]",
      danger:
        "bg-destructive text-white border-b-4 border-red-800 hover:bg-destructive/95 active:translate-y-[2px] active:border-b-2 shadow-sm font-display",
      ghost:
        "text-text-muted hover:text-text hover:bg-primary/10",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-3.5 text-xs rounded-xl",
      lg: "h-13 px-8 text-base rounded-2xl",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
