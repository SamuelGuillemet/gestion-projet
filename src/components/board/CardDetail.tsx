import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/models/task";
import { useAppStore } from "@/store";
import { TaskDetailContent } from "./TaskDetailContent";

interface CardDetailProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetail({ task, open, onOpenChange }: CardDetailProps) {
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

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
