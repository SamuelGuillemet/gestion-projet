import powershell from "highlight.js/lib/languages/powershell";
import { common } from "lowlight";
import { type ComponentPropsWithoutRef, useMemo } from "react";
import Markdown from "react-markdown";
import rehypeHighlightRaw from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import { EntityReferenceButton } from "@/components/shared/EntityReferenceButton";
import { cn } from "@/lib/utils";
import { IdbImage } from "./plugins/IdbImage";
import { Mermaid } from "./plugins/Mermaid";
import { rehypeEntityReferences } from "./plugins/rehype-entity-references";
import { rehypeIdbImages } from "./plugins/rehype-idb-images";
import { rehypeMermaid } from "./plugins/rehype-mermaid";

const rehypeHighlight = () =>
  rehypeHighlightRaw({ languages: { ...common, powershell } });

const remarkPlugins = [remarkGfm, remarkBreaks, remarkGithubAlerts];
const rehypePlugins = [
  rehypeEntityReferences,
  rehypeIdbImages,
  rehypeMermaid,
  rehypeHighlight,
];

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
    /^(https?|idb)$/i.test(value.slice(0, colon))
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

function MarkdownLink({
  children,
  className,
  href,
  ...props
}: ComponentPropsWithoutRef<"a"> & {
  "data-entity-reference"?: string;
}) {
  const { "data-entity-reference": entityReference, ...anchorProps } = props;

  if (typeof entityReference === "string") {
    return (
      <EntityReferenceButton
        referenceLabel={entityReference}
        className={cn("px-1.5", className)}
      />
    );
  }

  return (
    <a href={href} className={className} {...anchorProps}>
      {children}
    </a>
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
}: ComponentPropsWithoutRef<"img"> & {
  "data-markdown-image"?: string;
}) {
  const isMarkdownImage = typeof props["data-markdown-image"] === "string";
  if (isMarkdownImage && src) {
    return <IdbImage alt={alt} className={className} src={src} {...props} />;
  }

  return <img {...props} src={src} alt={alt} className={className} />;
}
