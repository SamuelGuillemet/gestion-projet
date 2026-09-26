import { FilePlus, FolderPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useNoteActions,
  useNoteFolderActions,
  useNoteFolderIdByNoteId,
  useNoteFolders,
  useNoteIds,
} from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import {
  NoteTreeContext,
  type NoteTreeContextValue,
  type NoteTreeDragItem,
  type NoteTreeDropTarget,
  sameDropTarget,
} from "./note-tree";
import { useNotesUI } from "./notes-state";
import { NoteTreeLevel } from "./NoteTree";

type Props = {
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
};

export function NoteList({ activeNoteId, setActiveNoteId }: Props) {
  const { activeProjectId } = useProjects();
  const { addNote, moveNote, deleteNote } = useNoteActions();
  const { addNoteFolder, moveNoteFolder } = useNoteFolderActions();
  const setFolderCollapsed = useNotesUI((s) => s.setFolderCollapsed);
  const noteIds = useNoteIds(activeProjectId);
  const folderIdByNoteId = useNoteFolderIdByNoteId(activeProjectId);
  const folders = useNoteFolders(activeProjectId);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<NoteTreeDragItem | null>(null);
  const [dropTargetState, setDropTargetState] = useState<NoteTreeDropTarget | null>(null);

  // dragover fires continuously: keep the previous state when nothing changed.
  const setDropTarget = (target: NoteTreeDropTarget | null) =>
    setDropTargetState((prev) => (sameDropTarget(prev, target) ? prev : target));

  const resetDrag = () => {
    setDragItem(null);
    setDropTargetState(null);
  };

  const handleAddNote = (folderId: string | null) => {
    if (!activeProjectId) return;
    const id = addNote(activeProjectId, "Sans titre", folderId);
    if (folderId) setFolderCollapsed(folderId, false);
    setActiveNoteId(id);
  };

  const handleAddFolder = (parentId: string | null) => {
    if (!activeProjectId) return;
    const id = addNoteFolder(activeProjectId, "Nouveau dossier", parentId);
    if (parentId) setFolderCollapsed(parentId, false);
    setEditingFolderId(id);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (activeNoteId === id) {
      const remaining = noteIds.filter((nid) => nid !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const item = dragItem;
    const target = dropTargetState;
    resetDrag();
    if (!item || !target) return;

    if (target.kind === "root") {
      if (item.kind === "note") moveNote(item.id, null);
      else moveNoteFolder(item.id, null);
      return;
    }

    if (target.kind === "note") {
      if (item.kind === "note") {
        moveNote(item.id, folderIdByNoteId[target.id] ?? null, {
          id: target.id,
          position: target.position,
        });
      }
      return;
    }

    if (target.position === "inside") {
      if (item.kind === "note") moveNote(item.id, target.id);
      else moveNoteFolder(item.id, target.id);
      setFolderCollapsed(target.id, false);
      return;
    }

    if (item.kind === "folder") {
      const parentId = folders.find((f) => f.id === target.id)?.parentId ?? null;
      moveNoteFolder(item.id, parentId, { id: target.id, position: target.position });
    }
  };

  const tree: NoteTreeContextValue = {
    folders,
    noteIds,
    folderIdByNoteId,
    activeNoteId,
    selectNote: setActiveNoteId,
    deleteNote: handleDelete,
    addNote: handleAddNote,
    addFolder: handleAddFolder,
    editingFolderId,
    setEditingFolderId,
    dragItem,
    // Mutating the DOM synchronously in dragstart cancels the drag in Chromium.
    startDrag: (item) => requestAnimationFrame(() => setDragItem(item)),
    dropTarget: dropTargetState,
    setDropTarget,
  };

  const isEmpty = noteIds.length === 0 && folders.length === 0;

  return (
    <NoteTreeContext value={tree}>
      <div className="flex w-64 shrink-0 flex-col border-r bg-background/60">
        <div className="flex items-center justify-between border-b p-3">
          <span className="atelier-section-title text-muted-foreground">Notes</span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Nouvelle note"
              aria-label="Nouvelle note"
              onClick={() => handleAddNote(null)}
            >
              <FilePlus className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Nouveau dossier"
              aria-label="Nouveau dossier"
              onClick={() => handleAddFolder(null)}
            >
              <FolderPlus className="size-4" />
            </Button>
          </div>
        </div>
        <div
          className={cn("flex flex-1 flex-col gap-px overflow-y-auto p-2 transition-colors", {
            "bg-primary/5": dropTargetState?.kind === "root",
          })}
          onDragOver={(e) => {
            if (!dragItem) return;
            e.preventDefault();
            setDropTarget({ kind: "root" });
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropTarget(null);
          }}
          onDrop={handleDrop}
          onDragEnd={resetDrag}
        >
          {isEmpty && (
            <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
              Aucune note. Créez une note ou un dossier.
            </p>
          )}
          <NoteTreeLevel parentId={null} />
        </div>
      </div>
    </NoteTreeContext>
  );
}
