import { HelpCircle, Trash2 } from "lucide-react";
import { QuestionStatusBadge } from "@/components/shared/QuestionStatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
        "group flex items-center gap-2 rounded-md border border-l-2 border-l-(--entity-question)! py-2 pr-2 pl-3 transition-colors",
        {
          "border-primary/25 bg-primary/7": selected,
          "border-transparent hover:hover:bg-accent/45": !selected,
        },
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        onClick={onSelect}
      >
        <HelpCircle
          className={cn("h-4 w-4 shrink-0", {
            "text-amber-500": question.status === "pending",
            "text-green-500": question.status === "resolved",
            "text-muted-foreground": question.status === "to-ask",
          })}
        />
        <span className="font-data shrink-0 text-[10px] text-muted-foreground">
          ?{question.number}
        </span>
        <span
          className={cn("flex-1 truncate text-sm", {
            "text-muted-foreground line-through": question.status === "resolved",
          })}
        >
          {question.title}
        </span>
        {question.recipient && (
          <span className="max-w-48 truncate rounded-sm border bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            → {question.recipient}
          </span>
        )}
        <QuestionStatusBadge status={question.status} />
      </button>
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        }
        title="Supprimer la question"
        description="Cette action est irréversible. La question sera définitivement supprimée."
        onConfirm={() => {
          deleteQuestion(questionId);
          clearIfSelected(questionId);
        }}
      />
    </div>
  );
}
