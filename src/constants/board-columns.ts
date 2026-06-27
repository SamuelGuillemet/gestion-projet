export interface BoardColumn {
  id: string;
  label: string;
  color: string;
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: "todo", label: "À faire", color: "#6b7280" },
  { id: "in-progress", label: "En cours", color: "#f59e0b" },
  { id: "waiting", label: "En attente", color: "#3b82f6" },
  { id: "done", label: "Fait", color: "#2faa4c" },
] as const;

export type BoardColumnId = (typeof BOARD_COLUMNS)[number]["id"];

export const DONE_COLUMN_ID = "done";

export const TODO_COLUMN_ID = "todo";

export function getEmptyRecordOfColumns(): Record<BoardColumnId, string[]> {
  return BOARD_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = [];
      return acc;
    },
    {} as Record<BoardColumnId, string[]>,
  );
}
