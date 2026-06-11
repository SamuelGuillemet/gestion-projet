import { QUESTION_STATUSES } from "@/constants/question-status";
import type { QuestionStatus } from "@/models/question";

export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  const s =
    QUESTION_STATUSES.find((q) => q.value === status) ?? QUESTION_STATUSES[0];
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
      style={{ backgroundColor: `${s.color}20`, color: s.color }}
    >
      {s.label}
    </span>
  );
}
