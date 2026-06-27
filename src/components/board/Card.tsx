import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "@/components/shared/TagBadge";
import { useTags } from "@/hooks/useTags";
import { useTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { CardDetail } from "./CardDetail";

interface CardProps {
  taskId: string;
  isDragging?: boolean;
}

export function Card({ taskId, isDragging }: CardProps) {
  const task = useTask(taskId);
  const { tags } = useTags();
  const [detailOpen, setDetailOpen] = useState(false);

  if (!task) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "group bg-card/88 shadow-sm hover:shadow-md p-3 pl-1 border hover:border-primary/30 border-l-2 border-l-(--ink)! rounded-md transition-all hover:-translate-y-0.5",
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
          <div className="flex-1 min-w-0">
            <span
              className={`block text-sm font-medium leading-snug ${task.done ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </span>
            {task.description && (
              <p className="mt-1 text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            {taskTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {taskTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>
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
