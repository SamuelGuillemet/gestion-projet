import { Columns, Edit, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNoteActions } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";

type Props = {
  activeNoteId: string | null;
  activeNote: { content?: string } | null | undefined;
};

export function NoteEditorPanel({ activeNoteId, activeNote }: Props) {
  const { updateNote } = useNoteActions();
  const [content, setContent] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode] = useState<"both" | "edit" | "preview">("both");

  useEffect(() => {
    setContent(activeNote?.content ?? "");
  }, [activeNote?.content]);

  const save = useCallback(
    (value: string) => {
      if (!activeNoteId) return;
      updateNote(activeNoteId, { content: value });
    },
    [activeNoteId, updateNote],
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), 500);
  };

  return (
    <div className="flex flex-col gap-1 px-4 grow">
      <div
        role="radiogroup"
        aria-label="Mode d'édition"
        className="flex items-center self-end gap-2 p-1 border rounded-md"
      >
        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "both"}
          title="Both (édition + prévisualisation)"
          onClick={() => setMode("both")}
          className={`${mode === "both" ? "bg-primary/10 text-primary" : "hover:bg-muted/50"} w-8 h-8 p-0 rounded-md`}
        >
          <Columns className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "edit"}
          title="Edit (édition seule)"
          onClick={() => setMode("edit")}
          className={`${mode === "edit" ? "bg-primary/10 text-primary" : "hover:bg-muted/50"} w-8 h-8 p-0 rounded-md`}
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "preview"}
          title="Preview (prévisualisation seule)"
          onClick={() => setMode("preview")}
          className={`${mode === "preview" ? "bg-primary/10 text-primary" : "hover:bg-muted/50"} w-8 h-8 p-0 rounded-md`}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-y-auto grow">
        <div
          className={cn("grid gap-4 min-w-0 h-min min-h-full p-1 pt-0", {
            "grid-cols-2": mode === "both",
            "grid-cols-1": mode !== "both",
          })}
        >
          {(mode === "both" || mode === "edit") && (
            <div className="flex flex-col min-h-0 grow">
              <span className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Édition
              </span>
              <Textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 min-h-0 font-mono text-sm resize-none"
                placeholder="Écrivez vos notes en Markdown..."
              />
            </div>
          )}

          {(mode === "both" || mode === "preview") && (
            <div className="flex flex-col min-h-0 grow">
              <span className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Prévisualisation
              </span>
              <div className="flex-1 bg-card p-5 border rounded-lg min-h-0">
                <article className="prose-code:bg-muted prose-pre:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:border prose-code:rounded max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary/80 prose prose-sm prose-slate">
                  <Markdown
                    remarkPlugins={[
                      remarkGfm,
                      remarkBreaks,
                      remarkGithubAlerts,
                    ]}
                  >
                    {content || "*Aucun contenu...*"}
                  </Markdown>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
