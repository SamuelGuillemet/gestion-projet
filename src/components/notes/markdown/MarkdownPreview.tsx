import powershell from "highlight.js/lib/languages/powershell";
import { common } from "lowlight";
import { type ComponentPropsWithoutRef, useMemo } from "react";
import Markdown from "react-markdown";
import rehypeHighlightRaw from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import { useEntityReferenceNavigation } from "@/hooks/useEntityReferenceNavigation";
import {
  ENTITY_REFERENCE_REGEX,
  parseEntityReference,
} from "@/lib/entity-references";
import { isMarkdownImageUri } from "@/lib/markdown-images";
import { cn } from "@/lib/utils";
import { IdbImage } from "./plugins/IdbImage";
import { Mermaid } from "./plugins/Mermaid";
import { rehypeIdbImages } from "./plugins/rehype-idb-images";
import { rehypeMermaid } from "./plugins/rehype-mermaid";

const rehypeHighlight = () =>
  rehypeHighlightRaw({ languages: { ...common, powershell } });

const remarkPlugins = [
  remarkGfm,
  remarkBreaks,
  remarkGithubAlerts,
  remarkEntityReferences,
];
const rehypePlugins = [rehypeIdbImages, rehypeMermaid, rehypeHighlight];
const ENTITY_REFERENCE_SCHEME = "entity-ref:";

const urlTransform = (value: string) => {
  const colon = value.indexOf(":");
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");

  if (
    colon === -1 ||
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    /^(https?|idb|entity-ref)$/i.test(value.slice(0, colon))
  ) {
    return value;
  }

  return "";
};

type Props = {
  content: string;
};

export function MarkdownPreview({ content }: Props) {
  const components = useMemo(
    () => ({
      a: MarkdownLink,
      img: MarkdownImage,
      pre: MarkdownPre,
      table: MarkdownTable,
    }),
    [],
  );

  return (
    <article className="prose-code:bg-muted prose-pre:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:border prose-code:rounded-sm max-w-none prose-headings:font-heading prose-headings:font-semibold prose-a:text-primary prose-code:text-primary/80 prose-p:leading-relaxed prose prose-sm prose-slate">
      <Markdown
        urlTransform={urlTransform}
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content || "*Aucun contenu...*"}
      </Markdown>
    </article>
  );
}

type MarkdownNode = {
  type?: string;
  value?: string;
  url?: string;
  title?: string | null;
  children?: MarkdownNode[];
};

const SKIPPED_REFERENCE_NODE_TYPES = new Set([
  "code",
  "inlineCode",
  "link",
  "linkReference",
]);

function remarkEntityReferences() {
  return (tree: MarkdownNode) => {
    linkEntityReferenceText(tree);
  };
}

function linkEntityReferenceText(node: MarkdownNode) {
  if (!node.children || SKIPPED_REFERENCE_NODE_TYPES.has(node.type ?? "")) {
    return;
  }

  node.children = node.children.flatMap((child) => {
    if (child.type === "text" && typeof child.value === "string") {
      return createEntityReferenceNodes(child.value);
    }

    linkEntityReferenceText(child);
    return [child];
  });
}

function createEntityReferenceNodes(value: string): MarkdownNode[] {
  const regex = new RegExp(ENTITY_REFERENCE_REGEX.source, "g");
  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(regex)) {
    const index = match.index ?? 0;
    const label = match[0];

    if (index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, index) });
    }

    nodes.push({
      type: "link",
      url: `${ENTITY_REFERENCE_SCHEME}${label}`,
      title: null,
      children: [{ type: "text", value: label }],
    });

    lastIndex = index + label.length;
  }

  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }

  return nodes.length > 0 ? nodes : [{ type: "text", value }];
}

function MarkdownLink({
  children,
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const openReference = useEntityReferenceNavigation();

  if (typeof href === "string" && href.startsWith(ENTITY_REFERENCE_SCHEME)) {
    const reference = parseEntityReference(
      href.slice(ENTITY_REFERENCE_SCHEME.length),
    );

    if (reference) {
      return (
        <button
          type="button"
          className={cn(
            "font-data text-primary underline underline-offset-2 hover:opacity-80",
            className,
          )}
          onClick={() => openReference(reference)}
        >
          {children}
        </button>
      );
    }
  }

  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}

function MarkdownPre({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre"> & {
  "data-markdown-mermaid"?: string;
}) {
  const definition = props["data-markdown-mermaid"];

  if (typeof definition === "string") {
    return <Mermaid definition={definition} className={className} />;
  }

  return (
    <pre {...props} className={className}>
      {children}
    </pre>
  );
}

function MarkdownTable({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="my-4 max-w-full overflow-x-auto">
      <table {...props} className={cn("min-w-full", className)} />
    </div>
  );
}

function MarkdownImage({
  alt,
  className,
  src,
  ...props
}: ComponentPropsWithoutRef<"img">) {
  if (typeof src === "string" && isMarkdownImageUri(src)) {
    return <IdbImage alt={alt} className={className} src={src} {...props} />;
  }

  return <img {...props} src={src} alt={alt} className={className} />;
}
