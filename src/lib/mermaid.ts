import mermaid from "mermaid";

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

export async function renderMermaid(definition: string) {
  ensureMermaidInitialized();
  const { svg } = await mermaid.render(
    `markdown-mermaid-${crypto.randomUUID()}`,
    definition,
  );
  return svg;
}
