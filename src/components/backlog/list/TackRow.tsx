import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { TagBadge } from "@/components/shared/TagBadge";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/useTags";
import { useTask, useTaskActions } from "@/hooks/useTasks";
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
      className={`flex items-center gap-2 pl-4 pr-2 py-2 group rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
      }`}
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
      <span
        className={`text-sm flex-1 truncate ${task.done ? "line-through text-muted-foreground" : ""}`}
      >
        {task.title}
      </span>
      {taskTags.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {taskTags.slice(0, 2).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <StatusBadge columnId={task.columnId} />
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(taskId);
          clearIfSelected(taskId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
