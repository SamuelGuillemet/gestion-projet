import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useNote, useNoteActions } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import { NOTE_TREE_DRAG_TYPE, useNoteTree } from "./note-tree";

export function NoteFileItem({ noteId }: { noteId: string }) {
  const note = useNote(noteId);
  const { updateNote } = useNoteActions();
  const tree = useNoteTree();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note?.title ?? "");

  if (!note) return null;

  const active = tree.activeNoteId === noteId;
  const dragging = tree.dragItem?.kind === "note" && tree.dragItem.id === noteId;
  const dropPosition =
    tree.dropTarget?.kind === "note" && tree.dropTarget.id === noteId
      ? tree.dropTarget.position
      : null;

  const handleSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed) updateNote(noteId, { title: trimmed });
    setEditing(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Folders dragged over a note bubble up to the enclosing folder.
    if (tree.dragItem?.kind !== "note") return;
    e.preventDefault();
    e.stopPropagation();
    if (dragging) {
      tree.setDropTarget(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    tree.setDropTarget({ kind: "note", id: noteId, position });
  };

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(NOTE_TREE_DRAG_TYPE, noteId);
        tree.startDrag({ kind: "note", id: noteId });
      }}
      onDragOver={handleDragOver}
      className={cn(
        "group relative flex h-9 items-center gap-2 rounded-md border border-l-2 px-2 py-1.5 transition-colors",
        {
          "border-primary/25 border-l-(--entity-task) bg-primary/8 text-primary": active,
          "border-transparent hover:bg-accent/50": !active,
          "opacity-40": dragging,
        },
      )}
    >
      {dropPosition && (
        <span
          className={cn(
            "pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-primary",
            dropPosition === "before" ? "-top-px" : "-bottom-px",
          )}
        />
      )}
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
          onClick={() => tree.selectNote(noteId)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(note.title);
            setEditing(true);
          }}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />
          <span className="flex-1 truncate text-xs leading-snug">
            {"("}
            <span className="font-data text-2xs">%{note.number}</span>
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
        onConfirm={() => tree.deleteNote(noteId)}
      />
    </div>
  );
}
