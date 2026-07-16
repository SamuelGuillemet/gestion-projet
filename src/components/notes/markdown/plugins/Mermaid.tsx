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
          "bg-destructive/5 my-2 p-3 border border-destructive/40 rounded-lg overflow-x-auto text-destructive text-xs",
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
          "flex justify-center items-center bg-muted/30 my-2 px-3 py-6 border rounded-lg min-h-20 text-muted-foreground text-sm",
          className,
        )}
      >
        Rendu du diagramme...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card my-2 p-3 border rounded-lg overflow-x-auto",
        className,
      )}
    >
      <div
        className="min-w-max mermaid-diagram"
        dangerouslySetInnerHTML={{ __html: currentDiagram.svg }}
      />
    </div>
  );
}
