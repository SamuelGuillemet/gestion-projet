import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { getEmptyRecordOfColumns } from "@/constants/board-columns";
import { useTaskStore } from "@/store";

export function useTasks() {
  return useTaskStore(useShallow((s) => s.tasks));
}

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

export function useTask(id: string) {
  return useTaskStore((s) => s.tasks.find((t) => t.id === id));
}

export function useTaskActions() {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const moveTask = useTaskStore((s) => s.dndTasks);
  return { addTask, updateTask, deleteTask, moveTask };
}
