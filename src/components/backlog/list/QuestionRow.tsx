import { HelpCircle, Trash2 } from "lucide-react";
import { QuestionStatusBadge } from "@/components/shared/QuestionStatusBadge";
import { Button } from "@/components/ui/button";
import { useQuestion, useQuestionActions } from "@/hooks/useQuestions";
import { cn } from "@/lib/utils";
import { useBacklogUI } from "../backlog-state";

export function QuestionRow({ questionId }: { questionId: string }) {
  const question = useQuestion(questionId);
  const { deleteQuestion } = useQuestionActions();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === questionId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  const onSelect = () => select({ type: "questions", id: questionId });

  if (!question) return null;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 py-2 pr-2 pl-3 border border-l-2 border-l-(--entity-question)! rounded-md transition-colors cursor-pointer",
        {
          "border-primary/25 bg-primary/7": selected,
          "border-transparent hover:hover:bg-accent/45": !selected,
        },
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <HelpCircle
        className={cn("w-4 h-4 shrink-0", {
          "text-amber-500": question.status === "pending",
          "text-green-500": question.status === "resolved",
          "text-muted-foreground": question.status === "to-ask",
        })}
      />
      <span
        className={cn("flex-1 text-sm truncate", {
          "line-through text-muted-foreground": question.status === "resolved",
        })}
      >
        {question.title}
      </span>
      {question.recipient && (
        <span className="bg-background/70 px-1.5 py-0.5 border rounded-sm max-w-48 text-[10px] text-muted-foreground truncate">
          → {question.recipient}
        </span>
      )}
      <QuestionStatusBadge status={question.status} />
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteQuestion(questionId);
          clearIfSelected(questionId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
