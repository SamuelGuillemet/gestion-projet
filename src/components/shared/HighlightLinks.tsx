import { ExternalLink } from "lucide-react";
import { Fragment } from "react";
import { splitEntityReferenceText } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import { EntityReferenceButton } from "./EntityReferenceButton";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_EXACT_REGEX = /^https?:\/\/[^\s]+$/;

interface HighlightLinksProps {
  text?: string | null;
  className?: string;
  projectId?: string | null;
}

export function HighlightLinks({
  text,
  className,
  projectId,
}: HighlightLinksProps) {
  if (!text?.trim()) {
    return null;
  }

  const lines = text.split(/\r?\n/);

  return (
    <div className={cn("flex flex-col", className)}>
      {lines.map((line, lineIndex) => {
        const parts = line.split(URL_REGEX).filter(Boolean);

        return (
          <Fragment key={`${line}-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              if (URL_EXACT_REGEX.test(part)) {
                return (
                  <a
                    key={`${part}-${partIndex}`}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:opacity-80 text-primary underline underline-offset-2 break-all"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {part}
                  </a>
                );
              }

              return splitEntityReferenceText(part).map((token, tokenIndex) => {
                if (token.type !== "entity-reference") return null;

                return (
                  <EntityReferenceButton
                    key={`${token.value}-${partIndex}-${tokenIndex}`}
                    reference={token.reference}
                    className="text-xs"
                    projectId={projectId}
                  />
                );
              });
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
