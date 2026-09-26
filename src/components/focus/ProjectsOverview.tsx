import { CircleDashed, CircleDot, Clipboard, Clock3, Hourglass } from "lucide-react";
import type { ReactNode } from "react";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { formatMinutes } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "./focus-data";
import { EmptyState, SectionTitle } from "./FocusPrimitives";

export function ProjectsOverview({ summaries }: { summaries: ProjectSummary[] }) {
  return (
    <section className="atelier-card grow rounded-md p-4">
      <SectionTitle icon={<CircleDot className="size-4" />} label="Projets" />
      {summaries.length === 0 ? (
        <EmptyState>Créez un projet pour voir les priorités du jour.</EmptyState>
      ) : (
        <div className="mt-3 grid grid-cols-5 gap-3 2xl:grid-cols-6">
          {summaries.map((summary) => (
            <ProjectOverviewCard key={summary.project.id} summary={summary} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectOverviewCard({ summary }: { summary: ProjectSummary }) {
  const { switchProject } = useProjectNavigation();

  const openProject = () => {
    switchProject(summary.project.id, false);
  };

  return (
    <button
      type="button"
      onClick={openProject}
      className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-md border bg-background/60 p-3 text-left transition-colors hover:bg-background/90"
    >
      <div className="flex min-w-0 items-start gap-2">
        <span
          className="mt-1 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: summary.project.color }}
        />
        <div className="min-w-0">
          <h3 className="truncate font-heading text-base font-semibold">{summary.project.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {summary.completedTasks}/{summary.totalTasks} tâches terminées
          </p>
        </div>
        <span className="font-data ml-auto shrink-0 text-sm font-semibold">
          {summary.progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full border bg-muted/60">
        <div
          className="transition-width h-full rounded-full"
          style={{
            width: `${summary.progress}%`,
            backgroundColor: summary.project.color,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
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

      <div className="flex min-h-5 flex-wrap gap-1">
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
          <span className="text-xs text-muted-foreground">Rien à signaler</span>
        ) : null}
      </div>
    </button>
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
    <div className="flex min-w-0 items-start gap-3 rounded-md border bg-card/70 px-2.5 py-2">
      <div className="pt-0.5 text-2xs text-muted-foreground">{icon}</div>
      <div>
        <div className="font-data truncate text-sm leading-none font-semibold">{value}</div>
        <div className="font-data mt-1 text-2xs text-muted-foreground uppercase">{label}</div>
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
        "inline-flex items-center rounded border px-1.5 py-0.5 text-2xs leading-none font-medium",
        tone === "amber" &&
          "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        tone === "blue" && "border-primary/35 bg-primary/10 text-primary",
        tone === "red" && "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400",
      )}
    >
      {label}
    </span>
  );
}
