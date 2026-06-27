import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "file:inline-flex bg-card/70 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80 file:bg-transparent disabled:opacity-50 px-2.5 py-1 border border-input aria-invalid:border-destructive focus-visible:border-ring dark:aria-invalid:border-destructive/50 file:border-0 rounded-md outline-none aria-invalid:ring-3 aria-invalid:ring-destructive/20 focus-visible:ring-3 focus-visible:ring-ring/35 dark:aria-invalid:ring-destructive/40 w-full min-w-0 h-8 file:h-6 file:font-medium placeholder:text-muted-foreground file:text-foreground md:text-sm file:text-sm text-base transition-colors disabled:cursor-not-allowed disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
