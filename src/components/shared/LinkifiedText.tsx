import { Fragment } from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

interface LinkifiedTextProps {
  text?: string | null;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  if (!text?.trim()) {
    return null;
  }

  const lines = text.split(/\r?\n/);

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const parts = line.split(URL_REGEX);

        return (
          <Fragment key={`${line}-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              if (!part || !/^https?:\/\/[^\s]+$/.test(part)) return null;

              return (
                <Fragment key={`${part}-${partIndex}`}>
                  <a
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
                  >
                    {part}
                  </a>
                  <br />
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
