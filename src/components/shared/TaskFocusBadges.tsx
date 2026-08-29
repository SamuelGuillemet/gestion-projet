import { CalendarDays, ListChecks, ListTree } from "lucide-react";
import { PRIORITY_OPTIONS, SIZE_OPTIONS } from "@/constants/task-options";
import { useSubtasks, useTask } from "@/hooks/useTasks";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import type { Task } from "@/models/task";

const PRIORITY_BY_VALUE = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option]),
) as Record<NonNullable<Task["priority"]>, (typeof PRIORITY_OPTIONS)[number]>;

const SIZE_BY_VALUE = Object.fromEntries(
  SIZE_OPTIONS.map((option) => [option.value, option]),
) as Record<NonNullable<Task["size"]>, (typeof SIZE_OPTIONS)[number]>;

const MAX_DUE_DAYS = 30; // Maximum number of days to display for due date

export function TaskFocusBadges({
  task,
  compact = false,
  showMetadata = true,
}: {
  task: Task;
  compact?: boolean;
  showMetadata?: boolean;
}) {
  const subtasks = useSubtasks(task.id);
  const parent = useTask(task.parentTaskId ?? "");
  const allChecks = task.checks?.length ?? 0;
  const doneChecks = (task.checks ?? []).filter((check) => check.done).length;
  const doneSubtasks = subtasks.filter((subtask) => subtask.done).length;
  const dueLabel = getDueLabel(task.dueDate);
  const showSize = !compact && task.size !== "small";
  const showDue =
    task.columnId !== "done" && dueLabel && dueLabel.day <= MAX_DUE_DAYS;

  if (
    (!showMetadata ||
      (!showDue && !task.priority && !showSize && doneChecks === 0)) &&
    !task.parentTaskId &&
    subtasks.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {showMetadata && showDue ? (
        <Badge
          tone={dueLabel.overdue ? "red" : "amber"}
          title="Date d'échéance"
        >
          <CalendarDays className="size-3" />
          {dueLabel.label}
        </Badge>
      ) : null}
      {showMetadata && task.priority ? (
        <Badge color={PRIORITY_BY_VALUE[task.priority].color} title="Priorité">
          {PRIORITY_BY_VALUE[task.priority].label}
        </Badge>
      ) : null}
      {showMetadata && task.size && showSize ? (
        <Badge color={SIZE_BY_VALUE[task.size].color} title="Taille">
          {SIZE_BY_VALUE[task.size].label}
        </Badge>
      ) : null}
      {showMetadata && allChecks > 0 ? (
        <Badge tone="green" title="Checks ouverts">
          <ListChecks className="size-3" />
          {doneChecks}/{allChecks}
        </Badge>
      ) : null}
      {task.parentTaskId ? (
        <Badge tone="blue" title={parent?.title ?? "Tâche parente"}>
          <ListTree className="size-3" />
          {parent
            ? `Sous-tâche de ${getEntityReferenceLabel("tasks", parent.number)}`
            : "Sous-tâche"}
        </Badge>
      ) : null}
      {subtasks.length > 0 ? (
        <Badge tone="blue" title="Progression des sous-tâches">
          <ListTree className="size-3" />
          {doneSubtasks}/{subtasks.length}
        </Badge>
      ) : null}
    </div>
  );
}

function Badge({
  children,
  tone = "neutral",
  color,
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "red" | "amber" | "green";
  color?: string;
  title: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 border rounded h-4.5 font-medium text-[10px] leading-none shrink-0",
        {
          "border-border bg-background/75 text-muted-foreground":
            tone === "neutral",
          "border-primary/35 bg-primary/10 text-primary": tone === "blue",
          "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400":
            tone === "red",
          "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-400":
            tone === "amber",
          "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400":
            tone === "green",
        },
      )}
      style={
        color
          ? {
              borderColor: `${color}55`,
              backgroundColor: `${color}16`,
              color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

function getDueLabel(dueDate?: string) {
  if (!dueDate) return null;

  const target = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (days < 0)
    return { label: `${Math.abs(days)} j`, overdue: true, day: days };
  if (days === 0) return { label: "Aujourd'hui", overdue: false, day: 0 };
  if (days === 1) return { label: "Demain", overdue: false, day: 1 };
  return { label: `J-${days}`, overdue: false, day: days };
}
