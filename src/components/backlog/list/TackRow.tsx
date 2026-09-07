import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { TagBadge } from "@/components/shared/TagBadge";
import { TaskFocusBadges } from "@/components/shared/TaskFocusBadges";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PRIORITY_BY_VALUE } from "@/constants/task-options";
import { useTags } from "@/hooks/useTags";
import { useTask, useTaskActions } from "@/hooks/useTasks";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import { useBacklogUI } from "../backlog-state";

export function TaskRow({ taskId }: { taskId: string }) {
  const task = useTask(taskId);
  const { deleteTask } = useTaskActions();
  const { tags } = useTags();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === taskId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  if (!task) return null;
  const taskTagIds = new Set(task.tags);
  const taskTags = tags.filter((t) => taskTagIds.has(t.id));
  const priority = task.priority ? PRIORITY_BY_VALUE[task.priority] : null;

  const onSelect = () => select({ type: "tasks", id: taskId });

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md border border-l-2 border-l-(--entity-task)! py-2 pr-2 pl-3 transition-colors",
        selected ? "border-primary/25 bg-primary/7" : "border-transparent hover:hover:bg-accent/45",
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <span className="shrink-0 text-muted-foreground">
        {task.done ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </span>
      <span className="font-data shrink-0 text-[10px] text-muted-foreground">
        {getEntityReferenceLabel("tasks", task.number)}
      </span>
      <span
        className={cn("flex-1 truncate text-sm", {
          "text-muted-foreground line-through": task.done,
        })}
      >
        {task.title}
      </span>
      <TaskFocusBadges task={task} compact showMetadata={false} />
      {taskTags.length > 0 && (
        <div className="flex shrink-0 gap-1">
          {taskTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      {priority ? (
        <span
          className="inline-flex h-4.5 shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] leading-none font-medium"
          style={{
            borderColor: `${priority.color}55`,
            backgroundColor: `${priority.color}16`,
            color: priority.color,
          }}
          title="Priorité"
        >
          {priority.label}
        </span>
      ) : null}
      <StatusBadge columnId={task.columnId} />
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
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
