import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Note } from "@/models/note";

function getNextNoteNumber(notes: Note[], projectId: string) {
  return (
    Math.max(
      0,
      ...notes
        .filter((note) => note.projectId === projectId)
        .map((note) => note.number ?? 0),
    ) + 1
  );
}

export interface NoteSlice {
  notes: Note[];
  addNote: (projectId: string, title: string) => void;
  updateNote: (
    id: string,
    data: Partial<Pick<Note, "title" | "content">>,
  ) => void;
  deleteNote: (id: string) => void;
}

export const createNoteSlice: StateCreator<NoteSlice, [], [], NoteSlice> = (
  set,
) => ({
  notes: [],

  addNote: (projectId, title) =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: generateId(),
          projectId,
          number: getNextNoteNumber(state.notes, projectId),
          title,
          content: "",
        },
      ],
    })),

  updateNote: (id, data) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
});
