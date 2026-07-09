import {
  CircleDashed,
  CircleDot,
  Clipboard,
  Clock3,
  Hourglass,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatMinutes } from "@/lib/time";
import { cn } from "@/lib/utils";
import { EmptyState, SectionTitle } from "./FocusPrimitives";
import type { ProjectSummary } from "./focus-data";

export function ProjectsOverview({
  summaries,
}: {
  summaries: ProjectSummary[];
}) {
  return (
    <section className="p-4 rounded-md atelier-card">
      <SectionTitle icon={<CircleDot className="size-4" />} label="Projets" />
      {summaries.length === 0 ? (
        <EmptyState>
          Créez un projet pour voir les priorités du jour.
        </EmptyState>
      ) : (
        <div className="gap-3 grid grid-cols-5 2xl:grid-cols-6 mt-3">
          {summaries.map((summary) => (
            <ProjectOverviewCard key={summary.project.id} summary={summary} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectOverviewCard({ summary }: { summary: ProjectSummary }) {
  return (
    <article className="flex flex-col gap-3 bg-background/60 p-3 border rounded-md min-w-0">
      <div className="flex items-start gap-2 min-w-0">
        <span
          className="mt-1 rounded-full size-3 shrink-0"
          style={{ backgroundColor: summary.project.color }}
        />
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-base truncate">
            {summary.project.name}
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {summary.completedTasks}/{summary.totalTasks} tâches terminées
          </p>
        </div>
        <span className="ml-auto font-data font-semibold text-sm shrink-0">
          {summary.progress}%
        </span>
      </div>

      <div className="bg-muted/60 border rounded-full h-2 overflow-hidden">
        <div
          className="rounded-full h-full transition-all"
          style={{
            width: `${summary.progress}%`,
            backgroundColor: summary.project.color,
          }}
        />
      </div>

      <div className="gap-2 grid grid-cols-2">
        <ProjectStat
          icon={<CircleDashed className="size-3" />}
          label="En cours"
          value={summary.inProgressTasks}
        />
        <ProjectStat
          icon={<Hourglass className="size-3" />}
          label="En attente"
          value={summary.waitingTasks}
        />
        <ProjectStat
          icon={<Clipboard className="size-3" />}
          label="À faire"
          value={summary.todoTasks}
        />
        <ProjectStat
          icon={<Clock3 className="size-3" />}
          label="Semaine"
          value={formatMinutes(summary.weekMinutes)}
        />
      </div>

      <div className="flex flex-wrap gap-1 min-h-5">
        <ProjectBadge
          tone="amber"
          show={summary.unansweredQuestions > 0}
          label={`${summary.unansweredQuestions} question${summary.unansweredQuestions > 1 ? "s" : ""}`}
        />
        <ProjectBadge
          tone="red"
          show={summary.overdueTasks > 0}
          label={`${summary.overdueTasks} en retard`}
        />
        <ProjectBadge
          tone="blue"
          show={summary.dueSoonTasks > 0}
          label={`${summary.dueSoonTasks} bientôt`}
        />
        {summary.unansweredQuestions === 0 &&
        summary.overdueTasks === 0 &&
        summary.dueSoonTasks === 0 ? (
          <span className="text-muted-foreground text-xs">Rien à signaler</span>
        ) : null}
      </div>
    </article>
  );
}

function ProjectStat({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-card/70 px-2.5 py-2 border rounded-md min-w-0">
      <div className="pt-0.5 text-[0.65rem] text-muted-foreground">{icon}</div>
      <div>
        <div className="font-data font-semibold text-sm truncate leading-none">
          {value}
        </div>
        <div className="mt-1 font-data text-[0.62rem] text-muted-foreground uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}

function ProjectBadge({
  show,
  label,
  tone,
}: {
  show: boolean;
  label: string;
  tone: "amber" | "blue" | "red";
}) {
  if (!show) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 border rounded font-medium text-[10px] leading-none",
        tone === "amber" &&
          "border-amber-500/35 bg-amber-500/10 text-amber-700",
        tone === "blue" && "border-primary/35 bg-primary/10 text-primary",
        tone === "red" && "border-red-500/35 bg-red-500/10 text-red-700",
      )}
    >
      {label}
    </span>
  );
}
