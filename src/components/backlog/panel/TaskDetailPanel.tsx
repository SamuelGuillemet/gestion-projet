import { TaskDetailContent } from "@/components/shared/TaskDetailContent";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { useBacklogUI } from "../backlog-state";

export function TaskDetailPanel({ taskId }: { taskId: string }) {
  const task = useTask(taskId);
  const { updateTask, deleteTask } = useTaskActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!task) return null;

  return (
    <TaskDetailContent
      task={task}
      onUpdate={(data) => updateTask(task.id, data)}
      onDelete={() => {
        deleteTask(task.id);
        clear();
      }}
    />
  );
}
