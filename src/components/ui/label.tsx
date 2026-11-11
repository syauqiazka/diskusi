import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-mono font-medium uppercase tracking-wider text-fluor/80 select-none block mb-1.5",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

