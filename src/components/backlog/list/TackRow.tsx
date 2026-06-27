import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { TagBadge } from "@/components/shared/TagBadge";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTags } from "@/hooks/useTags";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { useBacklogUI } from "../backlog-state";

export function TaskRow({
  taskId,
  filterTag,
}: {
  taskId: string;
  filterTag: string | null;
}) {
  const task = useTask(taskId);
  const { deleteTask } = useTaskActions();
  const { tags } = useTags();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === taskId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  if (!task) return null;
  // Apply tag filter
  if (filterTag && !task.tags.includes(filterTag)) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  const onSelect = () => select({ type: "tasks", id: taskId });

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md border border-l-2 border-l-(--entity-task)! py-2 pr-2 pl-3 transition-colors",
        selected
          ? "border-primary/25 bg-primary/7"
          : "border-transparent hover:hover:bg-accent/45",
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <span className="text-muted-foreground shrink-0">
        {task.done ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </span>
      <span className="font-data text-[10px] text-muted-foreground shrink-0">
        #{task.number}
      </span>
      <span
        className={cn("flex-1 text-sm truncate", {
          "line-through text-muted-foreground": task.done,
        })}
      >
        {task.title}
      </span>
      {taskTags.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {taskTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <StatusBadge columnId={task.columnId} />
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        }
        title="Supprimer la tâche"
        description="Cette action est irréversible. La tâche sera définitivement supprimée."
        onConfirm={() => {
          deleteTask(taskId);
          clearIfSelected(taskId);
        }}
      />
    </div>
  );
}
