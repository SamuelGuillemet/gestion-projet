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

export function NoteFileItem({
  noteId,
  active,
  onSelect,
  onRename,
  onDelete,
}: Props) {
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
        "group flex items-center gap-2 px-2 py-2 border border-l-2 rounded-md transition-colors cursor-pointer",
        {
          "border-primary/25 border-l-(--entity-task) bg-primary/8 text-primary":
            active,
          "border-transparent hover:bg-accent/50": !active,
        },
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <FileText className="opacity-70 w-3.5 h-3.5 shrink-0" />
      {editing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="px-1 py-0 h-6 text-xs"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-xs truncate leading-snug"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(note.title);
            setEditing(true);
          }}
        >
          {"("}
          <span className="font-data text-[10px]">%{note.number}</span>
          {") "}
          {note.title}
        </span>
      )}
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="destructive"
            size="icon"
            className="opacity-0 group-hover:opacity-100 size-5 transition-opacity"
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
