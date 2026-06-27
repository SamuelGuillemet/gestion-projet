import { Fragment } from "react";
import { useEntityReferenceNavigation } from "@/hooks/useEntityReferenceNavigation";
import {
  ENTITY_REFERENCE_REGEX,
  parseEntityReference,
} from "@/lib/entity-references";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const TOKEN_REGEX = new RegExp(
  `${URL_REGEX.source}|${ENTITY_REFERENCE_REGEX.source}`,
  "g",
);

interface LinkifiedTextProps {
  text?: string | null;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const openReference = useEntityReferenceNavigation();

  if (!text?.trim()) {
    return null;
  }

  const lines = text.split(/\r?\n/);

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const parts = line.split(TOKEN_REGEX).filter(Boolean);

        return (
          <Fragment key={`${line}-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              const reference = parseEntityReference(part);

              if (reference) {
                return (
                  <button
                    key={`${part}-${partIndex}`}
                    type="button"
                    className="font-data text-primary underline underline-offset-2 hover:opacity-80"
                    onClick={() => openReference(reference)}
                  >
                    {part}
                  </button>
                );
              }

              if (!/^https?:\/\/[^\s]+$/.test(part)) {
                return <Fragment key={`${part}-${partIndex}`}>{part}</Fragment>;
              }

              return (
                <a
                  key={`${part}-${partIndex}`}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
                >
                  {part}
                </a>
              );
            })}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </Fragment>
        );
      })}
    </div>
  );
}
