import { AlertTriangle, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { STALE_DAYS } from "@/constants/task-options";
import { EmptyState, ProjectName, SectionTitle } from "./FocusPrimitives";
import type { StaleFocusTask } from "./focus-data";

export function ImportantInformation({
  staleTasks,
  onOpenTask,
}: {
  staleTasks: StaleFocusTask[];
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <section className="p-4 rounded-md atelier-card">
      <div className="flex justify-between items-center gap-3">
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
        <div className="gap-2 grid md:grid-cols-2 xl:grid-cols-3 mt-3">
          {staleTasks.map(({ task, project, staleDays }) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpenTask(task.id)}
              className="group flex flex-col gap-2 bg-background/60 hover:bg-background/90 p-3 border rounded-md min-w-0 text-left transition-colors"
            >
              <div className="flex justify-between items-center gap-2">
                <ProjectName project={project} />
                <span className="font-data text-[10px] text-muted-foreground shrink-0">
                  #{task.number}
                </span>
              </div>
              <div className="font-medium group-hover:text-primary truncate">
                {task.title}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge columnId={task.columnId} />
                <span className="inline-flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/35 rounded font-medium text-[10px] text-amber-700 leading-none">
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
