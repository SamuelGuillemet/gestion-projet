import { ChevronRight, FilePlus, Folder, FolderOpen, FolderPlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useNoteFolderActions } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import type { NoteFolder } from "@/models/note";
import { isNoteFolderDescendant } from "@/store/slices/note.slice";
import { getFolderDropZone, NOTE_TREE_DRAG_TYPE, useNoteTree } from "./note-tree";
import { NoteFileItem } from "./NoteFileItem";
import { useNotesUI } from "./notes-state";

const AUTO_EXPAND_DELAY_MS = 600;

export function NoteTreeLevel({ parentId }: { parentId: string | null }) {
  const { folders, noteIds, folderIdByNoteId } = useNoteTree();
  const childFolders = folders.filter((f) => f.parentId === parentId);
  const childNoteIds = noteIds.filter((id) => (folderIdByNoteId[id] ?? null) === parentId);

  return (
    <>
      {childFolders.map((folder) => (
        <NoteFolderItem key={folder.id} folder={folder} />
      ))}
      {childNoteIds.map((id) => (
        <NoteFileItem key={id} noteId={id} />
      ))}
    </>
  );
}

function NoteFolderItem({ folder }: { folder: NoteFolder }) {
  const tree = useNoteTree();
  const { renameNoteFolder, deleteNoteFolder } = useNoteFolderActions();
  const collapsed = useNotesUI((s) => !!s.collapsedFolderIds[folder.id]);
  const setFolderCollapsed = useNotesUI((s) => s.setFolderCollapsed);
  const [editValue, setEditValue] = useState(folder.name);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editing = tree.editingFolderId === folder.id;
  const dragging = tree.dragItem?.kind === "folder" && tree.dragItem.id === folder.id;
  const dropPosition =
    tree.dropTarget?.kind === "folder" && tree.dropTarget.id === folder.id
      ? tree.dropTarget.position
      : null;
  const isInvalidFolderDrop =
    tree.dragItem?.kind === "folder" &&
    (dragging || isNoteFolderDescendant(tree.folders, folder.id, tree.dragItem.id));
  const hasChildren =
    tree.folders.some((f) => f.parentId === folder.id) ||
    Object.values(tree.folderIdByNoteId).includes(folder.id);
  const noteCount = Object.values(tree.folderIdByNoteId).filter((id) => id === folder.id).length;

  const clearExpandTimer = () => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
    expandTimer.current = null;
  };

  const handleSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed) renameNoteFolder(folder.id, trimmed);
    tree.setEditingFolderId(null);
  };

  const handleRowDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!tree.dragItem) return;
    e.stopPropagation();
    if (isInvalidFolderDrop) {
      tree.setDropTarget(null);
      return;
    }
    e.preventDefault();
    const position =
      tree.dragItem.kind === "note"
        ? "inside"
        : getFolderDropZone(e, e.currentTarget.getBoundingClientRect());
    tree.setDropTarget({ kind: "folder", id: folder.id, position });

    if (position !== "inside" || !collapsed) {
      clearExpandTimer();
    } else if (!expandTimer.current) {
      expandTimer.current = setTimeout(() => {
        setFolderCollapsed(folder.id, false);
        expandTimer.current = null;
      }, AUTO_EXPAND_DELAY_MS);
    }
  };

  // Reached when a folder is dragged over one of this folder's notes.
  const handleChildrenDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!tree.dragItem) return;
    e.stopPropagation();
    if (isInvalidFolderDrop) {
      tree.setDropTarget(null);
      return;
    }
    e.preventDefault();
    tree.setDropTarget({ kind: "folder", id: folder.id, position: "inside" });
  };

  return (
    <div className={cn({ "opacity-40": dragging })}>
      <div
        draggable={!editing}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData(NOTE_TREE_DRAG_TYPE, folder.id);
          tree.startDrag({ kind: "folder", id: folder.id });
        }}
        onDragOver={handleRowDragOver}
        onDragLeave={clearExpandTimer}
        className={cn(
          "group relative flex h-9 items-center gap-1 rounded-md border border-transparent px-1 py-1.5 transition-colors hover:bg-accent/50",
          { "border-primary/40 bg-primary/10": dropPosition === "inside" },
        )}
      >
        {(dropPosition === "before" || dropPosition === "after") && (
          <span
            className={cn(
              "pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-primary",
              dropPosition === "before" ? "-top-px" : "-bottom-px",
            )}
          />
        )}
        {editing ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0 opacity-0" />
            <FolderOpen className="size-3.5 shrink-0 text-(--entity-task)" />
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") tree.setEditingFolderId(null);
              }}
              className="h-6 px-1 py-0 text-xs"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            aria-expanded={!collapsed}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
            onClick={() => setFolderCollapsed(folder.id, !collapsed)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditValue(folder.name);
              tree.setEditingFolderId(folder.id);
            }}
          >
            <ChevronRight
              className={cn("size-3.5 shrink-0 opacity-60 transition-transform", {
                "rotate-90": !collapsed,
              })}
            />
            {collapsed ? (
              <Folder className="size-3.5 shrink-0 text-(--entity-task)" />
            ) : (
              <FolderOpen className="size-3.5 shrink-0 text-(--entity-task)" />
            )}
            <span className="flex-1 truncate text-xs leading-snug font-medium">{folder.name}</span>
            {noteCount > 0 && (
              <span className="font-data text-2xs text-muted-foreground group-focus-within:hidden group-hover:hidden">
                {noteCount}
              </span>
            )}
          </button>
        )}
        <div className="hidden items-center gap-0.5 group-hover:flex group-has-focus-visible:flex">
          {!editing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                title="Nouvelle note dans ce dossier"
                aria-label="Nouvelle note dans ce dossier"
                onClick={() => tree.addNote(folder.id)}
              >
                <FilePlus className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                title="Nouveau sous-dossier"
                aria-label="Nouveau sous-dossier"
                onClick={() => tree.addFolder(folder.id)}
              >
                <FolderPlus className="size-3" />
              </Button>
            </>
          )}
          <ConfirmDialog
            triggerClassName="inline-flex"
            stopPropagation
            trigger={
              <Button
                variant="destructive"
                size="icon"
                className="size-5"
                aria-label="Supprimer le dossier"
              >
                <Trash2 className="size-3" />
              </Button>
            }
            title="Supprimer le dossier"
            description="Le dossier sera supprimé. Les notes et sous-dossiers qu'il contient seront déplacés au niveau supérieur."
            onConfirm={() => deleteNoteFolder(folder.id)}
          />
        </div>
      </div>
      {!collapsed && (
        <div
          onDragOver={handleChildrenDragOver}
          className="ml-3.5 space-y-px border-l border-border/70 pl-1.5"
        >
          {hasChildren && <NoteTreeLevel parentId={folder.id} />}
        </div>
      )}
    </div>
  );
}
