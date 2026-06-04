import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Deliverable } from "@/models/deliverable";
import type { Note } from "@/models/note";
import type { Question } from "@/models/question";

export interface NoteSlice {
  notes: Note[];
  questions: Question[];
  deliverables: Deliverable[];
  addNote: (projectId: string, title: string) => void;
  updateNote: (
    id: string,
    data: Partial<Pick<Note, "title" | "content">>,
  ) => void;
  deleteNote: (id: string) => void;
  addQuestion: (projectId: string, title: string) => string;
  updateQuestion: (
    id: string,
    data: Partial<
      Pick<
        Question,
        "title" | "description" | "recipient" | "answer" | "status"
      >
    >,
  ) => void;
  deleteQuestion: (id: string) => void;
  addDeliverable: (projectId: string, title: string) => string;
  updateDeliverable: (
    id: string,
    data: Partial<
      Pick<Deliverable, "title" | "type" | "description" | "version" | "done">
    >,
  ) => void;
  deleteDeliverable: (id: string) => void;
}

export const createNoteSlice: StateCreator<NoteSlice, [], [], NoteSlice> = (
  set,
) => ({
  notes: [],
  questions: [],
  deliverables: [],

  addNote: (projectId, title) =>
    set((state) => ({
      notes: [
        ...state.notes,
        { id: generateId(), projectId, title, content: "" },
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

  addQuestion: (projectId, title) => {
    const id = generateId();
    set((state) => ({
      questions: [
        ...state.questions,
        { id, projectId, title, status: "to-ask" },
      ],
    }));
    return id;
  },

  updateQuestion: (id, data) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...data } : q,
      ),
    })),

  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),

  addDeliverable: (projectId, title) => {
    const id = generateId();
    set((state) => ({
      deliverables: [
        ...state.deliverables,
        { id, projectId, title, done: false },
      ],
    }));
    return id;
  },

  updateDeliverable: (id, data) =>
    set((state) => ({
      deliverables: state.deliverables.map((d) =>
        d.id === id ? { ...d, ...data } : d,
      ),
    })),

  deleteDeliverable: (id) =>
    set((state) => ({
      deliverables: state.deliverables.filter((d) => d.id !== id),
    })),
});
