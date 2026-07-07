import { CalendarDays, ListChecks } from "lucide-react";
import { PRIORITY_OPTIONS, SIZE_OPTIONS } from "@/constants/task-options";
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
}: {
  task: Task;
  compact?: boolean;
}) {
  const openChecks = (task.checks ?? []).filter((check) => !check.done).length;
  const dueLabel = getDueLabel(task.dueDate);
  const showSize = !compact && task.size !== "medium";
  const showDue =
    task.columnId !== "done" && dueLabel && dueLabel.day <= MAX_DUE_DAYS;

  if (!showDue && !task.priority && !showSize && openChecks === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {showDue ? (
        <Badge
          tone={dueLabel.overdue ? "red" : "amber"}
          title="Date d'échéance"
        >
          <CalendarDays className="size-3" />
          {dueLabel.label}
        </Badge>
      ) : null}
      {task.priority ? (
        <Badge color={PRIORITY_BY_VALUE[task.priority].color} title="Priorité">
          {PRIORITY_BY_VALUE[task.priority].label}
        </Badge>
      ) : null}
      {task.size && showSize ? (
        <Badge color={SIZE_BY_VALUE[task.size].color} title="Taille">
          {SIZE_BY_VALUE[task.size].label}
        </Badge>
      ) : null}
      {openChecks > 0 ? (
        <Badge tone="green" title="Checks ouverts">
          <ListChecks className="size-3" />
          {openChecks}
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
          "border-red-500/30 bg-red-500/10 text-red-700": tone === "red",
          "border-amber-500/35 bg-amber-500/10 text-amber-700":
            tone === "amber",
          "border-green-600/30 bg-green-600/10 text-green-700":
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
