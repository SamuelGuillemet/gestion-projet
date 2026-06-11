import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { TaskDetailContent } from "../shared/TaskDetailContent";

interface CardDetailProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetail({ taskId, open, onOpenChange }: CardDetailProps) {
  const task = useTask(taskId);
  const { updateTask, deleteTask } = useTaskActions();

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Détail de la tâche</DialogTitle>
        </DialogHeader>
        <TaskDetailContent
          task={task}
          onUpdate={(data) => updateTask(task.id, data)}
          onDelete={() => {
            deleteTask(task.id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
