import { useShallow } from "zustand/react/shallow";
import { useQuestionStore } from "@/store";
import { deleteQuestionCascade } from "@/store/cascade-delete";

export function useQuestionIds(projectId: string | null) {
  return useQuestionStore(
    useShallow((s) =>
      s.questions.filter((q) => q.projectId === projectId).map((q) => q.id),
    ),
  );
}

export function useQuestion(id: string) {
  return useQuestionStore((s) => s.questions.find((q) => q.id === id));
}

export function useQuestions() {
  return useQuestionStore(useShallow((s) => s.questions));
}

export function useQuestionActions() {
  const addQuestion = useQuestionStore((s) => s.addQuestion);
  const updateQuestion = useQuestionStore((s) => s.updateQuestion);
  const deleteQuestion = deleteQuestionCascade;
  return { addQuestion, updateQuestion, deleteQuestion };
}
