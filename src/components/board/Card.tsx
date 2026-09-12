import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import { useRef } from "react";
import { TagBadge } from "@/components/shared/TagBadge";
import { useRelationOfTask } from "@/hooks/useRelations";
import { useTags } from "@/hooks/useTags";
import { useTask } from "@/hooks/useTasks";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import { RelationBadge } from "../shared/RelationBadge";
import { TaskFocusBadges } from "../shared/TaskFocusBadges";

interface CardProps {
  taskId: string;
  isDragging?: boolean;
  onSelectTask?: (taskId: string) => void;
}

export function Card({ taskId, isDragging, onSelectTask }: CardProps) {
  const task = useTask(taskId);
  const { tags } = useTags();
  const relationStatuses = useRelationOfTask(taskId);

  if (!task) return null;

  const taskTagIds = new Set(task.tags);
  const taskTags = tags.filter((t) => taskTagIds.has(t.id));

  return (
    <div
      aria-label="Card"
      role="button"
      tabIndex={0}
      className={cn(
        "group rounded-md border border-l-2 border-l-(--ink)! bg-card/88 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        {
          "rotate-1 opacity-60 shadow-lg": isDragging,
          "opacity-70": task.done,
        },
      )}
      onClick={() => onSelectTask?.(taskId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectTask?.(taskId);
        }
      }}
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-2">
          <span className="font-data shrink-0 text-[14px] text-muted-foreground">
            {getEntityReferenceLabel("tasks", task.number)}
          </span>
          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span
              className={cn("block text-sm leading-snug font-medium", {
                "text-muted-foreground line-through": task.done,
              })}
            >
              {task.title}
            </span>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {task.description}
              </p>
            )}
            <TaskFocusBadges task={task} compact />
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {taskTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {relationStatuses.map((relation) => (
                  <RelationBadge
                    key={relation.id}
                    type={relation.type}
                    reference={relation.reference}
                    title={relation.title}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortableCard({
  taskId,
  index,
  columnId,
  onSelectTask,
}: {
  taskId: string;
  index: number;
  columnId: string;
  onSelectTask?: (taskId: string) => void;
}) {
  const sortableRef = useRef<HTMLDivElement>(null);
  const sortable = useSortable({
    id: taskId,
    index,
    type: "item",
    accept: "item",
    group: columnId,
    element: sortableRef,
  });

  return (
    <div ref={sortableRef}>
      <Card taskId={taskId} isDragging={sortable.isDragging} onSelectTask={onSelectTask} />
    </div>
  );
}
