import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono text-sm uppercase tracking-wider font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caution focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border";

    const variantStyles = {
      default:
        "bg-caution text-white border-caution hover:bg-caution/90 active:translate-y-[1px] shadow-sm",
      secondary:
        "bg-night text-fluor border-fluor/25 hover:border-fluor/50 hover:bg-fluor/5 active:translate-y-[1px] shadow-xs",
      outline:
        "bg-transparent text-fluor border-fluor/30 hover:border-caution hover:text-caution active:translate-y-[1px]",
      danger:
        "bg-alert text-white border-alert hover:bg-alert/90 active:translate-y-[1px] shadow-sm",
      ghost:
        "border-transparent text-fluor/80 hover:text-fluor hover:bg-fluor/5",
    };

    const sizeStyles = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-13 px-8 text-base",
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
