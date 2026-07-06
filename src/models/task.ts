import type { CheckItem } from "./shared";

export type TaskPriority = "low" | "medium" | "high";
export type TaskSize = "small" | "medium" | "large";

export interface Task {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description: string;
  columnId: string;
  order: number;
  tags: string[];
  done: boolean;
  priority?: TaskPriority;
  dueDate?: string;
  size?: TaskSize;
  checks?: CheckItem[];
  createdAt?: string;
  updatedAt?: string;
}
