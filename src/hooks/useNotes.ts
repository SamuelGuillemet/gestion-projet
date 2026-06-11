import { useShallow } from "zustand/react/shallow";
import { useNoteStore } from "@/store";

/** Returns IDs of notes for a project. Only re-renders on add/remove. */
export function useNoteIds(projectId: string | null) {
  return useNoteStore(
    useShallow((s) =>
      s.notes.filter((n) => n.projectId === projectId).map((n) => n.id),
    ),
  );
}

/** Subscribe to a single note by ID. */
export function useNote(id: string) {
  return useNoteStore((s) => s.notes.find((n) => n.id === id));
}

/** Returns IDs of questions for a project. */
export function useQuestionIds(projectId: string | null) {
  return useNoteStore(
    useShallow((s) =>
      s.questions.filter((q) => q.projectId === projectId).map((q) => q.id),
    ),
  );
}

/** Subscribe to a single question by ID. */
export function useQuestion(id: string) {
  return useNoteStore((s) => s.questions.find((q) => q.id === id));
}

/** Returns IDs of deliverables for a project. */
export function useDeliverableIds(projectId: string | null) {
  return useNoteStore(
    useShallow((s) =>
      s.deliverables.filter((d) => d.projectId === projectId).map((d) => d.id),
    ),
  );
}

/** Subscribe to a single deliverable by ID. */
export function useDeliverable(id: string) {
  return useNoteStore((s) => s.deliverables.find((d) => d.id === id));
}

/** Returns note action functions only (stable references). */
export function useNoteActions() {
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const addQuestion = useNoteStore((s) => s.addQuestion);
  const updateQuestion = useNoteStore((s) => s.updateQuestion);
  const deleteQuestion = useNoteStore((s) => s.deleteQuestion);
  const addDeliverable = useNoteStore((s) => s.addDeliverable);
  const updateDeliverable = useNoteStore((s) => s.updateDeliverable);
  const deleteDeliverable = useNoteStore((s) => s.deleteDeliverable);
  return {
    addNote,
    updateNote,
    deleteNote,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
  };
}
