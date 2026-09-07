import { useEffect, useState } from "react";
import { renderMermaid } from "@/lib/mermaid";
import { cn } from "@/lib/utils";

type Props = {
  definition: string;
  className?: string;
};

type MermaidState = {
  definition: string;
  svg: string | null;
  hasError: boolean;
};

export function Mermaid({ definition, className }: Props) {
  const trimmedDefinition = definition.trim();
  const [renderedDiagram, setRenderedDiagram] = useState<MermaidState>(() => ({
    definition: trimmedDefinition,
    svg: null,
    hasError: false,
  }));
  const currentDiagram =
    renderedDiagram.definition === trimmedDefinition
      ? renderedDiagram
      : { definition: trimmedDefinition, svg: null, hasError: false };

  useEffect(() => {
    if (!trimmedDefinition) {
      return;
    }

    let isDisposed = false;

    const renderDiagram = async () => {
      try {
        const nextSvg = await renderMermaid(trimmedDefinition);
        if (isDisposed) return;
        setRenderedDiagram({
          definition: trimmedDefinition,
          svg: nextSvg,
          hasError: false,
        });
      } catch {
        if (isDisposed) return;
        setRenderedDiagram({
          definition: trimmedDefinition,
          svg: null,
          hasError: true,
        });
      }
    };

    void renderDiagram();

    return () => {
      isDisposed = true;
    };
  }, [trimmedDefinition]);

  if (currentDiagram.hasError) {
    return (
      <pre
        className={cn(
          "my-2 overflow-x-auto rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive",
          className,
        )}
      >
        {definition}
      </pre>
    );
  }

  if (!currentDiagram.svg) {
    return (
      <div
        className={cn(
          "my-2 flex min-h-20 items-center justify-center rounded-lg border bg-muted/30 px-3 py-6 text-sm text-muted-foreground",
          className,
        )}
      >
        Rendu du diagramme...
      </div>
    );
  }

  return (
    <div className={cn("my-2 overflow-x-auto rounded-lg border bg-card p-3", className)}>
      <div
        className="mermaid-diagram min-w-max"
        dangerouslySetInnerHTML={{ __html: currentDiagram.svg }}
      />
    </div>
  );
}
