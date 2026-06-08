export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  tags: string[];
  done: boolean;
}
