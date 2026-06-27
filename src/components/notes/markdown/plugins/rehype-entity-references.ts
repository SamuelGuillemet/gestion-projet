import { splitEntityReferenceText } from "@/lib/entity-references";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: unknown;
};

const SKIPPED_TAG_NAMES = new Set(["a", "code", "pre", "script", "style"]);

function createEntityReferenceNodes(value: string): HastNode[] {
  return splitEntityReferenceText(value).map((token) => {
    if (token.type === "text") return { type: "text", value: token.value };

    return {
      type: "element",
      tagName: "a",
      properties: {
        href: "#",
        "data-entity-reference": token.value,
      },
      children: [{ type: "text", value: token.value }],
    };
  });
}

function visit(node: HastNode) {
  if (!node.children || SKIPPED_TAG_NAMES.has(node.tagName ?? "")) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === "text" && typeof child.value === "string") {
      return createEntityReferenceNodes(child.value);
    }

    visit(child);
    return [child];
  });
}

export function rehypeEntityReferences() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
