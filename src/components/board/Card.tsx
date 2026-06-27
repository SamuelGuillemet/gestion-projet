import { useSortable } from "@dnd-kit/react/sortable";
import {
  ArrowRightLeft,
  Ban,
  Copy,
  GripVertical,
  type LucideIcon,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TagBadge } from "@/components/shared/TagBadge";
import { useRelations } from "@/hooks/useRelations";
import { useTags } from "@/hooks/useTags";
import { useTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { RELATION_LABELS, type RelationType } from "@/models/relation";
import { CardDetail } from "./CardDetail";

const RELATION_CARD_STYLES: Record<
  RelationType,
  { icon: LucideIcon; className: string }
> = {
  blocks: { icon: Ban, className: "text-red-600 border-red-200 bg-red-50" },
  "blocked-by": {
    icon: ShieldAlert,
    className: "text-orange-600 border-orange-200 bg-orange-50",
  },
  relates: {
    icon: ArrowRightLeft,
    className: "text-blue-600 border-blue-200 bg-blue-50",
  },
  duplicates: {
    icon: Copy,
    className: "text-purple-600 border-purple-200 bg-purple-50",
  },
};

interface CardProps {
  taskId: string;
  isDragging?: boolean;
}

export function Card({ taskId, isDragging }: CardProps) {
  const task = useTask(taskId);
  const { tags } = useTags();
  const { relations } = useRelations();
  const [detailOpen, setDetailOpen] = useState(false);

  if (!task) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const relationStatuses = useMemo(() => {
    const counts = new Map<RelationType, number>();

    for (const relation of relations) {
      if (relation.sourceId !== task.id && relation.targetId !== task.id) {
        continue;
      }

      const displayType =
        relation.sourceId === task.id
          ? relation.type
          : getInverseType(relation.type);
      counts.set(displayType, (counts.get(displayType) ?? 0) + 1);
    }

    return [...counts.entries()];
  }, [relations, task.id]);

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
            <div className="flex items-start gap-1.5 min-w-0">
              <span className="font-data text-[10px] text-muted-foreground shrink-0">
                #{task.number}
              </span>
              <span
                className={cn("block text-sm font-medium leading-snug", {
                  "line-through text-muted-foreground": task.done,
                })}
              >
                {task.title}
              </span>
            </div>
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
            {relationStatuses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {relationStatuses.map(([type, count]) => {
                  const style = RELATION_CARD_STYLES[type];
                  const Icon = style.icon;

                  return (
                    <span
                      key={type}
                      className={cn(
                        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        style.className,
                      )}
                      title={RELATION_LABELS[type]}
                    >
                      <Icon className="size-3" />
                      {count > 1 ? count : null}
                    </span>
                  );
                })}
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

function getInverseType(type: RelationType): RelationType {
  switch (type) {
    case "blocks":
      return "blocked-by";
    case "blocked-by":
      return "blocks";
    default:
      return type;
  }
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
