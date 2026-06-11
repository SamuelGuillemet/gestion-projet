import type { QuestionStatus } from "@/models/question";

export const QUESTION_STATUSES: {
  value: QuestionStatus;
  label: string;
  color: string;
}[] = [
  { value: "to-ask", label: "À poser", color: "#6b7280" },
  { value: "pending", label: "En attente", color: "#f59e0b" },
  { value: "resolved", label: "Résolu", color: "#10b981" },
];
