import { createContext, useContext } from "react";
import type { NoteFolder } from "@/models/note";

export type NoteTreeDragItem = { kind: "note" | "folder"; id: string };

export type NoteTreeDropTarget =
  | { kind: "root" }
  | { kind: "note"; id: string; position: "before" | "after" }
  | { kind: "folder"; id: string; position: "before" | "after" | "inside" };

export type NoteTreeContextValue = {
  folders: NoteFolder[];
  noteIds: string[];
  folderIdByNoteId: Record<string, string | null>;
  activeNoteId: string | null;
  selectNote: (id: string) => void;
  deleteNote: (id: string) => void;
  addNote: (folderId: string | null) => void;
  addFolder: (parentId: string | null) => void;
  editingFolderId: string | null;
  setEditingFolderId: (id: string | null) => void;
  dragItem: NoteTreeDragItem | null;
  startDrag: (item: NoteTreeDragItem) => void;
  dropTarget: NoteTreeDropTarget | null;
  setDropTarget: (target: NoteTreeDropTarget | null) => void;
};

export const NoteTreeContext = createContext<NoteTreeContextValue | null>(null);

export function useNoteTree() {
  const ctx = useContext(NoteTreeContext);
  if (!ctx) throw new Error("useNoteTree must be used inside NoteTreeContext");
  return ctx;
}

export const NOTE_TREE_DRAG_TYPE = "application/x-gp-note-tree";

export function getFolderDropZone(event: React.DragEvent, rect: DOMRect) {
  const ratio = (event.clientY - rect.top) / rect.height;
  if (ratio < 0.25) return "before";
  if (ratio > 0.75) return "after";
  return "inside";
}

export function sameDropTarget(a: NoteTreeDropTarget | null, b: NoteTreeDropTarget | null) {
  if (a === b) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "root" || b.kind === "root") return true;
  return a.id === b.id && a.position === b.position;
}
