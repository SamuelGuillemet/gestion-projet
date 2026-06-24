type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: unknown;
};

function getTextContent(node: HastNode): string {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }

  if (!node.children) return "";
  return node.children.map(getTextContent).join("");
}

function hasMermaidLanguage(node: HastNode) {
  const className = node.properties?.className;
  if (Array.isArray(className)) {
    return className.some((value) => value === "language-mermaid");
  }

  if (typeof className === "string") {
    return className.split(/\s+/).some((value) => value === "language-mermaid");
  }

  return false;
}

function visit(node: HastNode) {
  if (!node.children) return;

  for (const [index, child] of node.children.entries()) {
    if (child.type === "element" && child.tagName === "pre" && child.children) {
      const codeNode = child.children.find(
        (preChild) =>
          preChild.type === "element" &&
          preChild.tagName === "code" &&
          hasMermaidLanguage(preChild),
      );

      if (codeNode) {
        const definition = getTextContent(codeNode).trim();

        if (definition.length > 0) {
          node.children[index] = {
            ...child,
            properties: {
              ...child.properties,
              "data-markdown-mermaid": definition,
            },
            children: [],
          };
          continue;
        }
      }
    }

    visit(child);
  }
}

export function rehypeMermaid() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
