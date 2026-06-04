export type QuestionStatus = "to-ask" | "pending" | "resolved";

export interface Question {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  recipient?: string;
  answer?: string;
  status: QuestionStatus;
}
