import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex bg-card/70 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80 disabled:opacity-50 px-2.5 py-2 border border-input aria-invalid:border-destructive focus-visible:border-ring dark:aria-invalid:border-destructive/50 rounded-md outline-none aria-invalid:ring-3 aria-invalid:ring-destructive/20 focus-visible:ring-3 focus-visible:ring-ring/35 dark:aria-invalid:ring-destructive/40 w-full min-h-16 placeholder:text-muted-foreground md:text-sm text-base transition-colors field-sizing-content disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
