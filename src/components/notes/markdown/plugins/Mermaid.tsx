import { useEffect, useState } from "react";
import { renderMermaid } from "@/lib/mermaid";
import { cn } from "@/lib/utils";

type Props = {
  definition: string;
  className?: string;
};

export function Mermaid({ definition, className }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const trimmedDefinition = definition.trim();
    if (!trimmedDefinition) {
      setSvg(null);
      setHasError(false);
      return;
    }

    let isDisposed = false;

    const renderDiagram = async () => {
      try {
        const nextSvg = await renderMermaid(trimmedDefinition);
        if (isDisposed) return;
        setSvg(nextSvg);
        setHasError(false);
      } catch {
        if (isDisposed) return;
        setSvg(null);
        setHasError(true);
      }
    };

    void renderDiagram();

    return () => {
      isDisposed = true;
    };
  }, [definition]);

  if (hasError) {
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

  if (!svg) {
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
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
