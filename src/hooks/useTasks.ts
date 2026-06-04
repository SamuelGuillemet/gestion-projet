import { useMemo } from "react";
import { useAppStore } from "@/store";

export function useTasks(projectId: string | null) {
  const tasks = useAppStore((s) => s.tasks);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const moveTask = useAppStore((s) => s.moveTask);
  const reorderTasks = useAppStore((s) => s.reorderTasks);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === projectId),
    [tasks, projectId],
  );

  return {
    tasks: projectTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  };
}
