import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer after:absolute relative after:-inset-x-3 after:-inset-y-2 flex justify-center items-center data-checked:bg-primary dark:bg-input/30 dark:data-checked:bg-primary disabled:opacity-50 group-has-disabled/field:opacity-50 border border-input data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:border-ring dark:aria-invalid:border-destructive/50 group-has-focus-visible/field-label:data-checked:border-primary group-has-focus-visible/field-label:not-data-checked:border-input rounded-lg outline-none aria-invalid:ring-3 aria-invalid:ring-destructive/20 focus-visible:ring-3 focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 group-has-focus-visible/field-label:ring-0 size-4 data-checked:text-primary-foreground transition-colors disabled:cursor-not-allowed shrink-0",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="place-content-center grid [&>svg]:size-3.5 text-current transition-none"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
