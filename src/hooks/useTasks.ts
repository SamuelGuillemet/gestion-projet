import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getEmptyRecordOfColumns } from "@/constants/board-columns";
import { useTaskStore } from "@/store";

/**
 * Returns the list of task IDs for a project
 * Only re-renders when IDs are added/removed/reordered — not when task content changes.
 * Sort first by column order, then by task order within each column.
 */
export function useTaskIds(projectId: string | null) {
  return useTaskStore(
    useShallow((s) =>
      s.tasks.filter((t) => t.projectId === projectId).map((t) => t.id),
    ),
  );
}

export function useTaskColumnRecord(projectId: string | null) {
  const tasks = useTaskStore(
    useShallow((s) =>
      s.tasks
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => a.order - b.order),
    ),
  );

  return useMemo(() => {
    const record = getEmptyRecordOfColumns();
    for (const task of tasks) {
      record[task.columnId].push(task.id);
    }
    return record;
  }, [tasks]);
}

/**
 * Subscribes to a single task by ID.
 * Only re-renders when this specific task's data changes.
 */
export function useTask(id: string) {
  return useTaskStore((s) => s.tasks.find((t) => t.id === id));
}

/**
 * Returns task action functions only (stable references, never cause re-renders).
 */
export function useTaskActions() {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const moveTask = useTaskStore((s) => s.dndTasks);
  return { addTask, updateTask, deleteTask, moveTask };
}
