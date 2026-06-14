import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Question } from "@/models/question";

export interface QuestionSlice {
  questions: Question[];
  addQuestion: (projectId: string, title: string) => string;
  updateQuestion: (
    id: string,
    data: Partial<
      Pick<
        Question,
        "title" | "description" | "recipient" | "answer" | "status"
      >
    >,
  ) => void;
  deleteQuestion: (id: string) => void;
}

export const createQuestionSlice: StateCreator<
  QuestionSlice,
  [],
  [],
  QuestionSlice
> = (set) => ({
  questions: [],

  addQuestion: (projectId, title) => {
    const id = generateId();
    set((state) => ({
      questions: [
        ...state.questions,
        { id, projectId, title, status: "to-ask" },
      ],
    }));
    return id;
  },

  updateQuestion: (id, data) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...data } : q,
      ),
    })),

  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),
});
