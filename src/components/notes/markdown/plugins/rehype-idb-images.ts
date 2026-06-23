import { isMarkdownImageUri } from "@/lib/markdown-images";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function visit(node: HastNode) {
  if (!node.children) return;

  for (const child of node.children) {
    if (child.type === "element") {
      if (child.tagName === "img") {
        const src = child.properties?.src;
        if (typeof src === "string" && isMarkdownImageUri(src)) {
          child.properties = {
            ...child.properties,
            "data-markdown-image": "true",
            decoding: "async",
            loading: "lazy",
          };
        }
      }

      visit(child);
    }
  }
}

export function rehypeIdbImages() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
