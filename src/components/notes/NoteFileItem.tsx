import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useNote } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";

type Props = {
  noteId: string;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
};

export function NoteFileItem({ noteId, active, onSelect, onRename, onDelete }: Props) {
  const note = useNote(noteId);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note?.title ?? "");

  if (!note) return null;

  const handleSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border border-l-2 px-2 py-2 transition-colors",
        {
          "border-primary/25 border-l-(--entity-task) bg-primary/8 text-primary": active,
          "border-transparent hover:bg-accent/50": !active,
        },
      )}
    >
      {editing ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="h-6 px-1 py-0 text-xs"
            autoFocus
          />
        </div>
      ) : (
        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
          onClick={onSelect}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(note.title);
            setEditing(true);
          }}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="flex-1 truncate text-xs leading-snug">
            {"("}
            <span className="font-data text-[10px]">%{note.number}</span>
            {") "}
            {note.title}
          </span>
        </button>
      )}
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="destructive"
            size="icon"
            className="size-5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </Button>
        }
        title="Supprimer la note"
        description="Cette action est irréversible. La note sera définitivement supprimée."
        onConfirm={onDelete}
      />
    </div>
  );
}
