"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "data-vertical:self-stretch bg-border data-horizontal:w-full data-vertical:w-px data-horizontal:h-px shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
