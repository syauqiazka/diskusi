import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full border border-fluor/20 bg-night px-3.5 py-2 text-base text-fluor placeholder:text-fluor/40 focus:border-caution focus:ring-1 focus:ring-caution focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono text-sm transition-colors shadow-2xs",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
