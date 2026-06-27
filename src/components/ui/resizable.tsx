import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex aria-[orientation=vertical]:flex-col w-full h-full",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  handleClassName,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
  handleClassName?: string;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "aria-[orientation=horizontal]:after:left-0 after:left-1/2 after:absolute relative after:inset-y-0 flex justify-center items-center bg-border focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ring-offset-background w-px aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:w-full after:w-1 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:h-px [&[aria-orientation=horizontal]>div]:rotate-90 aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0 after:-translate-x-1/2",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "z-10 flex bg-border rounded-lg w-1 h-6 shrink-0",
            handleClassName,
          )}
        />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
