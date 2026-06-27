import { Columns, Edit, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNoteActions } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "./markdown/MarkdownPreview";
import { MarkdownTextarea } from "./markdown/MarkdownTextarea";

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
    <div className="flex flex-col gap-3 p-3 grow">
      <div
        role="radiogroup"
        aria-label="Mode d'édition"
        className="flex items-center self-end gap-1 bg-background/75 p-1 border rounded-md"
      >
        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "both"}
          title="Both (édition + prévisualisation)"
          onClick={() => setMode("both")}
          className={cn(
            "h-8 w-8 rounded-md p-0",
            mode === "both"
              ? "bg-primary/10 text-primary"
              : "hover:bg-accent/70",
          )}
        >
          <Columns className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "edit"}
          title="Edit (édition seule)"
          onClick={() => setMode("edit")}
          className={cn(
            "h-8 w-8 rounded-md p-0",
            mode === "edit"
              ? "bg-primary/10 text-primary"
              : "hover:bg-accent/70",
          )}
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-pressed={mode === "preview"}
          title="Preview (prévisualisation seule)"
          onClick={() => setMode("preview")}
          className={cn(
            "h-8 w-8 rounded-md p-0",
            mode === "preview"
              ? "bg-primary/10 text-primary"
              : "hover:bg-accent/70",
          )}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-y-auto grow">
        <div
          className={cn("gap-3 grid p-1 pt-0 min-w-0 h-min min-h-full", {
            "grid-cols-2": mode === "both",
            "grid-cols-1": mode !== "both",
          })}
        >
          {(mode === "both" || mode === "edit") && (
            <div className="flex flex-col min-h-0 grow">
              <span className="mb-2 text-muted-foreground atelier-section-title">
                Édition
              </span>
              <MarkdownTextarea
                value={content}
                onChange={handleChange}
                className="flex-1 min-h-0"
                placeholder="Écrivez vos notes en Markdown..."
              />
            </div>
          )}

          {(mode === "both" || mode === "preview") && (
            <div className="flex flex-col min-h-0 grow">
              <span className="mb-2 text-muted-foreground atelier-section-title">
                Prévisualisation
              </span>
              <div className="flex-1 bg-background/80 p-5 border rounded-md min-h-0">
                <MarkdownPreview content={content} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
