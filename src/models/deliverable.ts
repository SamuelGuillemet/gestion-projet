export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  type?: string;
  description?: string;
  version?: string;
  done: boolean;
}
