import { QuestionDetailContent } from "@/components/shared/QuestionDetailContent";
import { useQuestion, useQuestionActions } from "@/hooks/useQuestions";
import { useBacklogUI } from "../backlog-state";

export function QuestionDetailPanel({ questionId }: { questionId: string }) {
  const question = useQuestion(questionId);
  const { updateQuestion, deleteQuestion } = useQuestionActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!question) return null;

  return (
    <QuestionDetailContent
      question={question}
      onUpdate={(data) => updateQuestion(question.id, data)}
      onDelete={() => {
        deleteQuestion(question.id);
        clear();
      }}
    />
  );
}
