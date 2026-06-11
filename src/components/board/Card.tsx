import { useSortable } from "@dnd-kit/react/sortable";
import { CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { DONE_COLUMN_ID, TODO_COLUMN_ID } from "@/constants/board-columns";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { useTagStore } from "@/store";
import { TagBadge } from "../shared/TagBadge";
import { CardDetail } from "./CardDetail";

interface CardProps {
  taskId: string;
  isDragging?: boolean;
}

export function Card({ taskId, isDragging }: CardProps) {
  const task = useTask(taskId);
  const tags = useTagStore(useShallow((s) => s.tags));
  const { updateTask, moveTask } = useTaskActions();
  const [detailOpen, setDetailOpen] = useState(false);

  if (!task) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDone = !task.done;
    updateTask(task.id, { done: newDone });
    if (newDone && task.columnId !== DONE_COLUMN_ID) {
      moveTask(task.id, DONE_COLUMN_ID, 0);
    } else if (!newDone && task.columnId === DONE_COLUMN_ID) {
      moveTask(task.id, TODO_COLUMN_ID, 0);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={`group rounded-lg border bg-card p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/30 transition-all ${
          isDragging ? "opacity-60 rotate-1 shadow-lg" : ""
        } ${task.done ? "opacity-70" : ""}`}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="opacity-0 group-hover:opacity-100 mt-0.5 w-4 h-4 text-muted-foreground/40 transition-opacity shrink-0" />
          <button
            type="button"
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={handleToggleDone}
          >
            {task.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium block ${task.done ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </span>
            {task.description && (
              <p className="mt-0.5 text-muted-foreground text-xs line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
        {taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 ml-10">
            {taskTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
      <CardDetail
        taskId={task.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

export function SortableCard({
  taskId,
  index,
}: {
  taskId: string;
  index: number;
}) {
  const sortable = useSortable({ id: taskId, index });

  return (
    <div ref={sortable.ref}>
      <Card taskId={taskId} isDragging={sortable.isDragging} />
    </div>
  );
}
