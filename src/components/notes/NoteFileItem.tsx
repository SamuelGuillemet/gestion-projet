import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNote } from "@/hooks/useNotes";

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
      className={`group flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-colors ${
        active ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <FileText className="opacity-60 w-3.5 h-3.5 shrink-0" />
      {editing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="px-1 py-0 h-5 text-xs"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-xs truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(note.title);
            setEditing(true);
          }}
        >
          {note.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-5 h-5 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
