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
        "flex h-12 w-full border-2 border-border bg-surface px-4 py-2.5 text-base text-text placeholder:text-text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-body text-sm transition-all rounded-2xl shadow-2xs",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
