import mermaid from "mermaid";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

let hasInitializedMermaid = false;

function ensureMermaidInitialized() {
  if (hasInitializedMermaid) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default",
  });

  hasInitializedMermaid = true;
}

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
        ensureMermaidInitialized();
        const { svg: nextSvg } = await mermaid.render(
          `markdown-mermaid-${crypto.randomUUID()}`,
          trimmedDefinition,
        );

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
          "my-2 overflow-x-auto rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-xs",
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
          "my-2 flex min-h-20 items-center justify-center rounded-lg border bg-muted/30 px-3 py-6 text-muted-foreground text-sm",
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
        "my-2 overflow-x-auto rounded-lg border bg-card p-3",
        className,
      )}
    >
      <div
        className="mermaid-diagram min-w-max"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
