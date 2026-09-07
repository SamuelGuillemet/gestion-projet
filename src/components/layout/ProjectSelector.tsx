import { Check, ChevronDown, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import type { Project } from "@/models/project";

const DEFAULT_PROJECT_COLOR = "#6366f1";

type ProjectDraft = {
  projectId: string | null;
  name: string;
  color: string;
  description: string;
};

type ProjectDraftUpdate = Partial<Omit<ProjectDraft, "projectId">>;

const createProjectDraft = (): ProjectDraft => ({
  projectId: null,
  name: "",
  color: DEFAULT_PROJECT_COLOR,
  description: "",
});

const getBaseProjectDraft = (isCreating: boolean, activeProject: Project | null): ProjectDraft => {
  if (isCreating || !activeProject) {
    return createProjectDraft();
  }

  return {
    projectId: activeProject.id,
    name: activeProject.name,
    color: activeProject.color,
    description: activeProject.description ?? "",
  };
};

type ProjectDetailsFormProps = {
  activeProject: Project | null;
  isCreating: boolean;
  currentDraft: ProjectDraft;
  hasChanges: boolean;
  updateDraft: (data: ProjectDraftUpdate) => void;
  onSubmit: () => void;
  onDeleteActiveProject: () => void;
};

function ProjectDetailsForm({
  activeProject,
  isCreating,
  currentDraft,
  hasChanges,
  updateDraft,
  onSubmit,
  onDeleteActiveProject,
}: ProjectDetailsFormProps) {
  if (!activeProject && !isCreating) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sélectionnez ou créez un projet.
      </p>
    );
  }

  const SubmitIcon = isCreating ? Plus : Check;
  const submitLabel = isCreating ? "Créer" : "Enregistrer";

  return (
    <>
      <div>
        <Label htmlFor="project-name" className="text-xs">
          Nom
        </Label>
        <Input
          id="project-name"
          value={currentDraft.name}
          onChange={(event) => updateDraft({ name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          className="mt-1 h-8"
        />
      </div>
      <div>
        <Label htmlFor="project-description" className="text-xs">
          Description
        </Label>
        <Textarea
          id="project-description"
          value={currentDraft.description}
          onChange={(event) => updateDraft({ description: event.target.value })}
          className="mt-1 h-24 resize-none"
          placeholder="Description du projet"
        />
      </div>
      <div>
        <Label className="text-xs">Couleur</Label>
        <input
          type="color"
          aria-label="Project color"
          value={currentDraft.color}
          onChange={(event) => updateDraft({ color: event.target.value })}
          className={cn("mt-2 block size-7 cursor-pointer rounded-full border bg-background")}
        />
      </div>
      <Button
        size="sm"
        className="w-full gap-1.5"
        disabled={!currentDraft.name.trim() || (!isCreating && !hasChanges)}
        onClick={onSubmit}
      >
        <SubmitIcon className="size-4" />
        {submitLabel}
      </Button>
      {!isCreating && activeProject ? (
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-1 h-3 w-3" />
              Supprimer le projet
            </Button>
          }
          title="Supprimer le projet"
          description="Cette action est irréversible. Le projet, ses tâches, questions, livrables, notes, jalons et entrées de temps seront supprimés."
          onConfirm={onDeleteActiveProject}
        />
      ) : null}
    </>
  );
}

export function ProjectSelector() {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const location = useLocation();
  const { switchProject, switchToDashboard } = useProjectNavigation();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const isDashboard = location.pathname.startsWith("/dashboard");
  const showProjectDetails = !isDashboard || isCreating;

  const baseDraft = getBaseProjectDraft(isCreating, activeProject);
  const currentDraft = draft?.projectId === baseDraft.projectId ? draft : baseDraft;

  const updateDraft = (data: ProjectDraftUpdate) => {
    setDraft({ ...currentDraft, ...data });
  };

  const handleDeleteActiveProject = () => {
    if (!activeProject) return;

    deleteProject(activeProject.id);
    setActiveProject(null);
    setDraft(createProjectDraft());
    setIsCreating(true);
    switchToDashboard();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && !activeProject) {
      setIsCreating(true);
      setDraft(createProjectDraft());
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setDraft(createProjectDraft());
  };

  const handleSelectProject = (id: string) => {
    setIsCreating(false);
    setDraft(null);
    if (activeProjectId === id && !isDashboard) return;
    switchProject(id);
  };

  const handleSelectDashboard = () => {
    setIsCreating(false);
    setDraft(null);
    switchToDashboard();
  };

  const handleCreate = () => {
    if (!currentDraft.name.trim()) return;

    const id = addProject(
      currentDraft.name.trim(),
      currentDraft.color,
      currentDraft.description.trim() || undefined,
    );
    setIsCreating(false);
    setDraft(null);
    switchProject(id, false);
  };

  const handleSave = () => {
    if (!activeProject || !currentDraft.name.trim()) return;

    updateProject(activeProject.id, {
      name: currentDraft.name.trim(),
      color: currentDraft.color,
      description: currentDraft.description.trim() || undefined,
    });
    setDraft(null);
  };

  const hasChanges =
    !!activeProject &&
    (currentDraft.name !== activeProject.name ||
      currentDraft.color !== activeProject.color ||
      currentDraft.description !== (activeProject.description ?? ""));

  const handleSubmit = () => {
    if (isCreating) {
      handleCreate();
      return;
    }

    handleSave();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="group/project relative">
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="flex h-9 w-72 min-w-0 items-center justify-start gap-2 px-2"
            >
              {isDashboard ? (
                <LayoutDashboard className="size-4 shrink-0 text-primary" />
              ) : (
                <span
                  className="size-2.5 shrink-0 rounded-full ring-2 ring-background"
                  style={{
                    backgroundColor: activeProject?.color ?? "var(--rule-strong)",
                  }}
                />
              )}
              <span className="grow truncate text-left font-heading text-lg leading-none font-semibold tracking-normal">
                {isDashboard ? "Dashboard" : (activeProject?.name ?? "Aucun projet")}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-55" />
            </Button>
          }
        />
        {!isDashboard && activeProject?.description && !open ? (
          <div className="pointer-events-none absolute top-full left-0 z-40 mt-1 w-72 opacity-0 transition-opacity group-hover/project:opacity-100">
            <div className="rounded-md border bg-popover p-2 text-xs leading-relaxed text-popover-foreground shadow-md">
              {activeProject.description}
            </div>
          </div>
        ) : null}
      </div>

      <PopoverContent align="start" side="bottom" className="w-180 max-w-[calc(100vw-2rem)] p-3">
        <div className="grid grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-3">
          <div className="min-w-0">
            <div className="atelier-section-title mb-2 text-muted-foreground">Projets</div>
            <button
              type="button"
              onClick={handleSelectDashboard}
              className={cn(
                "mb-1 flex w-full shrink-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                isDashboard && !isCreating
                  ? "border-primary/35 bg-primary/8"
                  : "border-transparent hover:bg-accent/55",
              )}
            >
              <LayoutDashboard className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">Dashboard</span>
            </button>
            <div className="h-66 flex-1 space-y-1 overflow-y-auto pr-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelectProject(project.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                    !isDashboard && !isCreating && activeProjectId === project.id
                      ? "border-primary/25 bg-primary/8"
                      : "border-transparent hover:bg-accent/55",
                  )}
                >
                  <span
                    className="mt-1 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{project.name}</span>
                    {project.description ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {project.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
              {projects.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">Aucun projet.</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleStartCreate}
              className={cn(
                "mt-1 flex w-full shrink-0 items-center gap-2 rounded-md border border-dashed px-2 py-1.5 text-left transition-colors",
                isCreating
                  ? "border-primary/35 bg-primary/8"
                  : "border-muted-foreground/30 hover:bg-accent/55",
              )}
            >
              <Plus className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium">Nouveau projet</span>
            </button>
          </div>

          <div
            className={cn(
              "min-w-0 space-y-3 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3",
              showProjectDetails ? "visible" : "invisible",
            )}
          >
            <div className="atelier-section-title text-muted-foreground">
              {isCreating ? "Nouveau projet" : "Détails"}
            </div>
            <ProjectDetailsForm
              activeProject={activeProject}
              isCreating={isCreating}
              currentDraft={currentDraft}
              hasChanges={hasChanges}
              updateDraft={updateDraft}
              onSubmit={handleSubmit}
              onDeleteActiveProject={handleDeleteActiveProject}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
