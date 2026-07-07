import { HelpCircle, ListTodo } from "lucide-react";
import type { ReactNode } from "react";
import { QuestionStatusBadge } from "@/components/shared/QuestionStatusBadge";
import { TaskFocusBadges } from "@/components/shared/TaskFocusBadges";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import type { Project } from "@/models/project";
import { EmptyState, ProjectName, SectionTitle } from "./FocusPrimitives";
import type { FocusOverviewItem } from "./focus-data";

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
    <section className="p-4 rounded-md atelier-card">
      <div className="flex justify-between items-center gap-3">
        <SectionTitle icon={icon} label={label} />
        <span className="font-data text-[0.68rem] text-muted-foreground uppercase">
          {countLabel}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div className="flex flex-col gap-2 mt-3">
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
  const number = item.type === "task" ? item.task.number : item.question.number;
  const title = item.type === "task" ? item.task.title : item.question.title;
  const marker: "#" | "?" = item.type === "task" ? "#" : "?";

  return (
    <button
      type="button"
      onClick={() => {
        if (item.type === "task") {
          onOpenTask(item.task.id);
          return;
        }

        onOpenQuestion(item.question.id);
      }}
      className="group flex items-center gap-3 bg-background/60 hover:bg-background/90 p-3 border rounded-md w-full min-w-0 text-left transition-colors"
    >
      <Icon className="size-4 shrink-0" />
      <div className="flex flex-col flex-1 gap-2 min-w-0">
        <ItemBody
          project={item.project}
          number={number}
          title={title}
          type={marker}
        />
        {item.type === "task" ? <TaskFocusBadges task={item.task} /> : null}
      </div>
      {item.type === "task" ? (
        <StatusBadge columnId={item.task.columnId} />
      ) : (
        <QuestionStatusBadge status={item.question.status} />
      )}
    </button>
  );
}

function ItemBody({
  project,
  number,
  title,
  type,
}: {
  project: Project | null | undefined;
  number: number;
  title: string;
  type: "#" | "?";
}) {
  return (
    <div className="min-w-0 grow">
      <div className="flex items-center gap-2 min-w-0 text-muted-foreground text-xs">
        <ProjectName project={project} />
        <span className="font-data shrink-0">
          {type}
          {number}
        </span>
      </div>
      <div className="mt-1 font-medium group-hover:text-primary truncate">
        {title}
      </div>
    </div>
  );
}

function getFocusOverviewItemKey(item: FocusOverviewItem) {
  return item.type === "task"
    ? `task-${item.task.id}`
    : `question-${item.question.id}`;
}
