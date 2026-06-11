import { useShallow } from "zustand/react/shallow";
import { useTaskStore } from "@/store";

/**
 * Returns the list of task IDs for a project, optionally filtered by column.
 * Only re-renders when IDs are added/removed/reordered — not when task content changes.
 */
export function useTaskIds(projectId: string | null, columnId?: string) {
  return useTaskStore(
    useShallow((s) =>
      s.tasks
        .filter(
          (t) =>
            t.projectId === projectId &&
            (columnId == null || t.columnId === columnId),
        )
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id),
    ),
  );
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
  const moveTask = useTaskStore((s) => s.moveTask);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  return { addTask, updateTask, deleteTask, moveTask, reorderTasks };
}
