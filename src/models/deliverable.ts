export interface Deliverable {
  id: string;
  projectId: string;
  number: number;
  title: string;
  type?: string;
  description?: string;
  version?: string;
  done: boolean;
}
