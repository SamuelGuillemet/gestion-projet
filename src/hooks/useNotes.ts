import { useMemo } from "react";
import { useAppStore } from "@/store";

export function useNotes(projectId: string | null) {
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const questions = useAppStore((s) => s.questions);
  const addQuestion = useAppStore((s) => s.addQuestion);
  const updateQuestion = useAppStore((s) => s.updateQuestion);
  const deleteQuestion = useAppStore((s) => s.deleteQuestion);
  const deliverables = useAppStore((s) => s.deliverables);
  const addDeliverable = useAppStore((s) => s.addDeliverable);
  const updateDeliverable = useAppStore((s) => s.updateDeliverable);
  const deleteDeliverable = useAppStore((s) => s.deleteDeliverable);

  const projectNotes = useMemo(
    () => notes.filter((n) => n.projectId === projectId),
    [notes, projectId],
  );

  const projectQuestions = useMemo(
    () => questions.filter((q) => q.projectId === projectId),
    [questions, projectId],
  );

  const projectDeliverables = useMemo(
    () => deliverables.filter((d) => d.projectId === projectId),
    [deliverables, projectId],
  );

  return {
    notes: projectNotes,
    addNote,
    updateNote,
    deleteNote,
    questions: projectQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    deliverables: projectDeliverables,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
  };
}
