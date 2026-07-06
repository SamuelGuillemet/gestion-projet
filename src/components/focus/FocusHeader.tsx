import { ChevronDown, Filter, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/models/project";

export function FocusHeader({
  dateLabel,
  projectCount,
  openTaskCount,
  inProgressCount,
  todoCount,
  blockedCount,
  projects,
  hiddenProjectIds,
  onProjectVisibilityChange,
  onShowAllProjects,
}: {
  dateLabel: string;
  projectCount: number;
  openTaskCount: number;
  inProgressCount: number;
  todoCount: number;
  blockedCount: number;
  projects: Project[];
  hiddenProjectIds: Set<string>;
  onProjectVisibilityChange: (projectId: string, visible: boolean) => void;
  onShowAllProjects: () => void;
}) {
  return (
    <header className="flex flex-row justify-between items-start gap-4 p-4 rounded-md atelier-card">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-primary atelier-section-title">
          <Target className="size-4" aria-hidden="true" />
          Focus
        </div>
        <h1 className="mt-2 font-heading font-semibold text-3xl tracking-normal">
          {dateLabel.toUpperCase()}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {projectCount} {pluralize(projectCount, "projet", "projets")} ·{" "}
          {openTaskCount}{" "}
          {pluralize(openTaskCount, "tâche ouverte", "tâches ouvertes")}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 min-w-0">
        <ProjectFilterDropdown
          projects={projects}
          hiddenProjectIds={hiddenProjectIds}
          onProjectVisibilityChange={onProjectVisibilityChange}
          onShowAllProjects={onShowAllProjects}
        />
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-3 min-w-0">
          <HeaderStat label="En cours" value={inProgressCount} />
          <HeaderStat label="À faire" value={todoCount} />
          <HeaderStat label="Bloqués" value={blockedCount} />
        </div>
      </div>
    </header>
  );
}

function ProjectFilterDropdown({
  projects,
  hiddenProjectIds,
  onProjectVisibilityChange,
  onShowAllProjects,
}: {
  projects: Project[];
  hiddenProjectIds: Set<string>;
  onProjectVisibilityChange: (projectId: string, visible: boolean) => void;
  onShowAllProjects: () => void;
}) {
  const hiddenCount = projects.filter((project) =>
    hiddenProjectIds.has(project.id),
  ).length;
  const visibleCount = projects.length - hiddenCount;
  const label = getProjectFilterLabel(projects.length, visibleCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="justify-between bg-background/70 w-full sm:w-46 font-normal"
          >
            <Filter className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate">{label}</span>
            <ChevronDown className="opacity-50 size-4 shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projets affichés</DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuCheckboxItem
              key={project.id}
              checked={!hiddenProjectIds.has(project.id)}
              closeOnClick={false}
              label={project.name}
              onCheckedChange={(visible) =>
                onProjectVisibilityChange(project.id, visible)
              }
            >
              <span
                className="rounded-full size-2.5 shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate">{project.name}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        {projects.length === 0 ? (
          <DropdownMenuItem disabled>Aucun projet</DropdownMenuItem>
        ) : null}
        {hiddenCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShowAllProjects}>
              Tout afficher
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getProjectFilterLabel(projectCount: number, visibleCount: number) {
  if (projectCount === 0) return "Aucun projet";
  if (projectCount === visibleCount) return "Tous les projets";
  return `${visibleCount}/${projectCount} projets`;
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background/70 px-3 py-2 border rounded-md min-w-24">
      <div className="font-data font-semibold text-xl leading-none">
        {value}
      </div>
      <div className="mt-1 font-data text-[0.65rem] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}

function pluralize(count: number, singular: string, plural: string) {
  return count > 1 ? plural : singular;
}
