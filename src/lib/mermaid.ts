let hasInitializedMermaid = false;

async function ensureMermaidInitialized() {
  const mermaid = (await import("mermaid")).default;

  if (hasInitializedMermaid) return mermaid;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default",
  });

  hasInitializedMermaid = true;

  return mermaid;
}

export async function renderMermaid(definition: string) {
  const mermaid = await ensureMermaidInitialized();
  const { svg } = await mermaid.render(
    `markdown-mermaid-${crypto.randomUUID()}`,
    definition,
  );
  return svg;
}
