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
}
