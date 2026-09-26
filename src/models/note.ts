export interface Note {
  id: string;
  projectId: string;
  number: number;
  title: string;
  content: string;
  /** Missing or null means the note sits at the project root. */
  folderId?: string | null;
}

export interface NoteFolder {
  id: string;
  projectId: string;
  name: string;
  parentId: string | null;
}

export type NoteTreeAnchor = { id: string; position: "before" | "after" };
