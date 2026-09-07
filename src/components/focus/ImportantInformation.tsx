import { AlertTriangle, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { STALE_DAYS } from "@/constants/task-options";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import type { StaleFocusTask } from "./focus-data";
import { EmptyState, ProjectName, SectionTitle } from "./FocusPrimitives";

export function ImportantInformation({
  staleTasks,
  onOpenTask,
}: {
  staleTasks: StaleFocusTask[];
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <section className="atelier-card rounded-md p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle
          icon={<AlertTriangle className="size-4" />}
          label="Informations importantes"
        />
        <span className="font-data text-[0.68rem] text-muted-foreground uppercase">
          {STALE_DAYS} j sans mouvement
        </span>
      </div>

      {staleTasks.length === 0 ? (
        <EmptyState>Aucune tâche ouverte ne semble figée.</EmptyState>
      ) : (
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {staleTasks.map(({ task, project, staleDays }) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task.id)}
              className="group flex min-w-0 flex-col gap-2 rounded-md border bg-background/60 p-3 text-left transition-colors hover:bg-background/90"
            >
              <div className="flex items-center justify-between gap-2">
                <ProjectName project={project} />
                <span className="font-data shrink-0 text-[10px] text-muted-foreground">
                  {getEntityReferenceLabel("tasks", task.number)}
                </span>
              </div>
              <div className="truncate font-medium group-hover:text-primary">{task.title}</div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge columnId={task.columnId} />
                <span className="inline-flex items-center gap-1 rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] leading-none font-medium text-amber-700 dark:text-amber-400">
                  <Clock3 className="size-3" />
                  {staleDays} j
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
