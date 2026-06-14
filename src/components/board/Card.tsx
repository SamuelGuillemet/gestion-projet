import { useSortable } from "@dnd-kit/react/sortable";
import { CheckCircle2, Circle, GripVertical } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "@/components/shared/TagBadge";
import { DONE_COLUMN_ID, TODO_COLUMN_ID } from "@/constants/board-columns";
import { useTags } from "@/hooks/useTags";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { CardDetail } from "./CardDetail";

interface CardProps {
  taskId: string;
  isDragging?: boolean;
}

export function Card({ taskId, isDragging }: CardProps) {
  const task = useTask(taskId);
  const { tags } = useTags();
  const { updateTask } = useTaskActions();
  const [detailOpen, setDetailOpen] = useState(false);

  if (!task) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  const handleToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDone = !task.done;
    updateTask(task.id, {
      done: newDone,
      columnId: newDone ? DONE_COLUMN_ID : TODO_COLUMN_ID,
    });
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "group bg-card shadow-sm hover:shadow-md p-3 border hover:border-primary/30 rounded-lg transition-all cursor-pointer",
          {
            "opacity-60 rotate-1 shadow-lg": isDragging,
            "opacity-70": task.done,
          },
        )}
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
  columnId,
}: {
  taskId: string;
  index: number;
  columnId: string;
}) {
  const sortable = useSortable({
    id: taskId,
    index,
    type: "item",
    accept: "item",
    group: columnId,
  });

  return (
    <div ref={sortable.ref}>
      <Card taskId={taskId} isDragging={sortable.isDragging} />
    </div>
  );
}
