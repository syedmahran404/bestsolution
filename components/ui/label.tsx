import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight label primitive (shadcn style) without the optional
 * @radix-ui/react-label dependency — keeps the dependency surface minimal.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
