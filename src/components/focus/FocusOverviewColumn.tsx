import { ExternalLink, HelpCircle, ListTodo } from "lucide-react";
import type { ReactNode } from "react";
import { QuestionStatusBadge } from "@/components/shared/QuestionStatusBadge";
import { TaskFocusBadges } from "@/components/shared/TaskFocusBadges";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { useEntityNavigation } from "@/hooks/useEntityReferenceNavigation";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import type { Project } from "@/models/project";
import type { FocusOverviewItem } from "./focus-data";
import { EmptyState, ProjectName, SectionTitle } from "./FocusPrimitives";

export function FocusOverviewColumn({
  icon,
  label,
  countLabel,
  items,
  emptyLabel,
  onOpenTask,
  onOpenQuestion,
}: {
  icon: ReactNode;
  label: string;
  countLabel: string;
  items: FocusOverviewItem[];
  emptyLabel: string;
  onOpenTask: (taskId: string) => void;
  onOpenQuestion: (questionId: string) => void;
}) {
  return (
    <section className="atelier-card rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={icon} label={label} />
        <span className="font-data text-[0.68rem] text-muted-foreground uppercase">
          {countLabel}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <FocusOverviewCard
              key={getFocusOverviewItemKey(item)}
              item={item}
              onOpenTask={onOpenTask}
              onOpenQuestion={onOpenQuestion}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FocusOverviewCard({
  item,
  onOpenTask,
  onOpenQuestion,
}: {
  item: FocusOverviewItem;
  onOpenTask: (taskId: string) => void;
  onOpenQuestion: (questionId: string) => void;
}) {
  const Icon = item.type === "task" ? ListTodo : HelpCircle;
  const title = item.type === "task" ? item.task.title : item.question.title;
  const reference =
    item.type === "task"
      ? getEntityReferenceLabel("tasks", item.task.number)
      : getEntityReferenceLabel("questions", item.question.number);
  const openEntity = useEntityNavigation();

  return (
    <div className="group flex w-full min-w-0 items-center gap-3 rounded-md border bg-background/60 p-3 transition-colors hover:bg-background/90">
      <button
        type="button"
        onClick={() => {
          if (item.type === "task") {
            onOpenTask(item.task.id);
            return;
          }

          onOpenQuestion(item.question.id);
        }}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Icon className="size-4 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ItemBody project={item.project} reference={reference} title={title} />
          {item.type === "task" ? <TaskFocusBadges task={item.task} /> : null}
        </div>
        {item.type === "task" ? (
          <StatusBadge columnId={item.task.columnId} />
        ) : (
          <QuestionStatusBadge status={item.question.status} />
        )}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        title="Ouvrir dans le backlog"
        onClick={() =>
          openEntity(
            item.type === "task"
              ? { type: "tasks", id: item.task.id }
              : { type: "questions", id: item.question.id },
          )
        }
      >
        <ExternalLink className="size-3.5" />
      </Button>
    </div>
  );
}

function ItemBody({
  project,
  reference,
  title,
}: {
  project: Project | null | undefined;
  reference: string;
  title: string;
}) {
  return (
    <div className="min-w-0 grow">
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <ProjectName project={project} />
        <span className="font-data shrink-0">{reference}</span>
      </div>
      <div className="mt-1 truncate font-medium group-hover:text-primary">{title}</div>
    </div>
  );
}

function getFocusOverviewItemKey(item: FocusOverviewItem) {
  return item.type === "task" ? `task-${item.task.id}` : `question-${item.question.id}`;
}
