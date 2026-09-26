import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Note, NoteFolder, NoteTreeAnchor } from "@/models/note";
import { getNextProjectScopedNumber } from "./utils";

export interface NoteSlice {
  notes: Note[];
  noteFolders: NoteFolder[];
  addNote: (projectId: string, title: string, folderId?: string | null) => string;
  updateNote: (id: string, data: Partial<Pick<Note, "title" | "content">>) => void;
  deleteNote: (id: string) => void;
  moveNote: (id: string, folderId: string | null, anchor?: NoteTreeAnchor) => void;
  addNoteFolder: (projectId: string, name: string, parentId?: string | null) => string;
  renameNoteFolder: (id: string, name: string) => void;
  /** Children (notes and sub-folders) are moved up to the deleted folder's parent. */
  deleteNoteFolder: (id: string) => void;
  moveNoteFolder: (id: string, parentId: string | null, anchor?: NoteTreeAnchor) => void;
}

// Array order is the display order among siblings.
function moveInArray<T extends { id: string }>(
  items: T[],
  id: string,
  update: (item: T) => T,
  anchor?: NoteTreeAnchor,
) {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const rest = items.filter((i) => i.id !== id);
  const anchorIndex = anchor ? rest.findIndex((i) => i.id === anchor.id) : -1;
  let index = rest.length;
  if (anchor && anchorIndex !== -1) {
    index = anchor.position === "before" ? anchorIndex : anchorIndex + 1;
  }
  rest.splice(index, 0, update(item));
  return rest;
}

export function isNoteFolderDescendant(
  folders: NoteFolder[],
  folderId: string,
  ancestorId: string,
) {
  let current = folders.find((f) => f.id === folderId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    const parentId: string = current.parentId;
    current = folders.find((f) => f.id === parentId);
  }
  return false;
}

export const createNoteSlice: StateCreator<NoteSlice, [], [], NoteSlice> = (set) => ({
  notes: [],
  noteFolders: [],

  addNote: (projectId, title, folderId = null) => {
    const id = generateId();
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id,
          projectId,
          number: getNextProjectScopedNumber(state.notes, projectId),
          title,
          content: "",
          folderId,
        },
      ],
    }));
    return id;
  },

  updateNote: (id, data) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),

  moveNote: (id, folderId, anchor) =>
    set((state) => ({
      notes: moveInArray(state.notes, id, (n) => ({ ...n, folderId }), anchor),
    })),

  addNoteFolder: (projectId, name, parentId = null) => {
    const id = generateId();
    set((state) => ({
      noteFolders: [...state.noteFolders, { id, projectId, name, parentId }],
    }));
    return id;
  },

  renameNoteFolder: (id, name) =>
    set((state) => ({
      noteFolders: state.noteFolders.map((f) => (f.id === id ? { ...f, name } : f)),
    })),

  deleteNoteFolder: (id) =>
    set((state) => {
      const folder = state.noteFolders.find((f) => f.id === id);
      if (!folder) return state;
      return {
        noteFolders: state.noteFolders
          .filter((f) => f.id !== id)
          .map((f) => (f.parentId === id ? { ...f, parentId: folder.parentId } : f)),
        notes: state.notes.map((n) =>
          n.folderId === id ? { ...n, folderId: folder.parentId } : n,
        ),
      };
    }),

  moveNoteFolder: (id, parentId, anchor) =>
    set((state) => {
      if (
        parentId === id ||
        (parentId && isNoteFolderDescendant(state.noteFolders, parentId, id))
      ) {
        return state;
      }
      return {
        noteFolders: moveInArray(state.noteFolders, id, (f) => ({ ...f, parentId }), anchor),
      };
    }),
});
