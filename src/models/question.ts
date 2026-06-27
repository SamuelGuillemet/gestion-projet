export type QuestionStatus = "to-ask" | "pending" | "resolved";

export interface Question {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description?: string;
  recipient?: string;
  answer?: string;
  status: QuestionStatus;
}
