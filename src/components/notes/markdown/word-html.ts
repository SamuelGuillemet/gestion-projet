import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import {
  resolveImageSourceAsDataUrl,
  svgStringToPngDataUrl,
} from "@/lib/blob-utils";
import { renderMermaid } from "@/lib/mermaid";
import { rehypeEntityReferences } from "./plugins/rehype-entity-references";
import { rehypeIdbImages } from "./plugins/rehype-idb-images";
import { rehypeMermaid } from "./plugins/rehype-mermaid";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: unknown;
};

const REMARK_PLUGINS = [remarkGfm, remarkBreaks, remarkGithubAlerts] as const;

const REHYPE_PLUGINS = [
  rehypeEntityReferences,
  rehypeIdbImages,
  rehypeMermaid,
  rehypeCustomAssets,
] as const;

function rehypeCustomAssets() {
  const transformMermaidNode = async (node: HastNode) => {
    if (node.tagName !== "pre") return;

    const definition = node.properties?.["data-markdown-mermaid"];
    if (typeof definition !== "string" || definition.trim().length === 0) {
      return;
    }

    try {
      const pngDataUrl = await svgStringToPngDataUrl(
        await renderMermaid(definition.trim()),
      );
      node.tagName = "img";
      node.properties = {
        src: pngDataUrl,
      };
      node.children = [];
    } catch {
      // Keep fallback pre content when conversion fails.
    }
  };

  const transformImageNode = async (node: HastNode) => {
    if (node.tagName !== "img") return;

    const src = node.properties?.src;
    if (typeof src !== "string") return;

    const dataUrl = await resolveImageSourceAsDataUrl(src);
    node.properties = {
      src: dataUrl,
    };
  };

  const transformAnchorNode = async (node: HastNode) => {
    if (node.tagName !== "a") return;

    const isEntityReference = node.properties?.["data-entity-reference"];
    if (isEntityReference) {
      // Remove entity reference links to avoid broken links in Word export.
      node.tagName = "span";
      node.properties = {};
      node.children = [];
    }
  };

  const transformAlertDivNode = async (node: HastNode) => {
    if (node.tagName !== "div") {
      return;
    }

    const className = node.properties?.class;
    if (
      typeof className !== "string" ||
      !className.includes("markdown-alert")
    ) {
      return;
    }

    node.tagName = "blockquote";

    const titleNodeFinder = (child: HastNode) =>
      child.type === "element" &&
      child.tagName === "p" &&
      child.properties?.class === "markdown-alert-title";
    const title = node.children?.find(titleNodeFinder)?.children?.[1]?.value;

    const rest =
      node.children?.filter((child) => !titleNodeFinder(child)) ?? [];

    const newChildren = [];
    if (title && typeof title === "string") {
      newChildren.push({
        type: "element",
        tagName: "p",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "strong",
            properties: {},
            children: [
              {
                type: "text",
                value: `${title}:`,
              },
            ],
          },
        ],
      });
    }
    newChildren.push(...rest);

    node.children = newChildren;
  };

  const visitNode = async (node: HastNode): Promise<void> => {
    if (!node.children) return;

    await Promise.all(
      node.children.map(async (child) => {
        if (child.type === "element") {
          await transformMermaidNode(child);
          await transformImageNode(child);
          await transformAnchorNode(child);
          await transformAlertDivNode(child);
        }

        await visitNode(child);
      }),
    );
  };

  return async (tree: HastNode) => {
    await visitNode(tree);
  };
}

function buildWordHtmlDocument(bodyHtml: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      pre { white-space: pre-wrap; }
      code { white-space: pre-wrap; }
      table { border-collapse: collapse; width: 100%; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { line-height: 1.5; }
      img, svg { display: block; max-width: 100%; height: auto; }
      p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
      p { text-wrap: pretty; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; text-wrap: balance;}
    </style>
  </head>
  <body>${bodyHtml}</body>
</html>`;
}

async function renderMarkdownToWordHtml(markdown: string) {
  const processor = unified().use(remarkParse);

  for (const plugin of REMARK_PLUGINS) {
    processor.use(plugin);
  }

  processor.use(remarkRehype);

  for (const plugin of REHYPE_PLUGINS) {
    processor.use(plugin);
  }

  processor.use(rehypeStringify);

  const result = await processor.process(markdown || "");
  return buildWordHtmlDocument(String(result));
}

export async function copyPreviewToWord(markdownText: string) {
  if (!navigator.clipboard) {
    return false;
  }

  if (typeof ClipboardItem === "undefined") {
    await navigator.clipboard.writeText(markdownText);
    return true;
  }

  const htmlDocument = await renderMarkdownToWordHtml(markdownText);
  const clipboardItem = new ClipboardItem({
    "text/html": new Blob([htmlDocument], { type: "text/html" }),
    "text/plain": new Blob([markdownText], { type: "text/plain" }),
  });

  await navigator.clipboard.write([clipboardItem]);
  return true;
}
