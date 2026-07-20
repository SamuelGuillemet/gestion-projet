import { Check, ClipboardCopy, Columns, Edit, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNote, useNoteActions } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "./markdown/MarkdownPreview";
import { MarkdownTextarea } from "./markdown/MarkdownTextarea";
import { copyPreviewToWord } from "./markdown/word-html";

type Props = {
  activeNoteId: string;
};

export function NoteEditorPanel({ activeNoteId }: Props) {
  const { updateNote } = useNoteActions();
  const activeNote = useNote(activeNoteId);
  const [content, setContent] = useState(activeNote?.content ?? "");
  const copyFeedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mode, setMode] = useState<"both" | "edit" | "preview">("both");
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const save = (value: string) => {
    if (!activeNoteId) return;
    updateNote(activeNoteId, { content: value });
  };

  useEffect(
    () => () => {
      if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current);
    },
    [],
  );

  const handleChange = (value: string) => {
    setContent(value);
    save(value);
  };

  const handleCopyForWord = async () => {
    try {
      await copyPreviewToWord(content);

      setCopyState("success");
    } catch {
      setCopyState("error");
    }

    if (copyFeedbackRef.current) clearTimeout(copyFeedbackRef.current);
    copyFeedbackRef.current = setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div className="flex flex-col gap-3 p-3 grow">
      <div
        role="radiogroup"
        aria-label="Mode d'édition"
        className="flex items-center self-end gap-1"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleCopyForWord();
          }}
          title="Copier un contenu compatible avec Word"
          className={cn(
            "h-8",
            copyState === "error" && "border-red-500/50 text-red-700",
          )}
        >
          {copyState === "success" ? (
            <Check className="mr-1 w-4 h-4" />
          ) : (
            <ClipboardCopy className="mr-1 w-4 h-4" />
          )}
          {copyState === "success" ? "Copié" : "Copy to Word"}
        </Button>

        <div className="flex items-center gap-1 bg-background/75 p-1 border rounded-md">
          <Button
            size="icon"
            variant="ghost"
            aria-pressed={mode === "both"}
            title="Both (édition + prévisualisation)"
            onClick={() => setMode("both")}
            className={cn(
              "p-0 rounded-md w-8 h-8",
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
              "p-0 rounded-md w-8 h-8",
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
              "p-0 rounded-md w-8 h-8",
              mode === "preview"
                ? "bg-primary/10 text-primary"
                : "hover:bg-accent/70",
            )}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
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
