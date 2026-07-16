import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import type { Project } from "@/models/project";
import { useBacklogUI } from "../backlog/backlog-state";

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

const getBaseProjectDraft = (
  isCreating: boolean,
  activeProject: Project | null,
): ProjectDraft => {
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
      <p className="py-6 text-muted-foreground text-sm text-center">
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
          className={cn(
            "block bg-background mt-2 border rounded-full size-7 cursor-pointer",
          )}
        />
      </div>
      <Button
        size="sm"
        className="gap-1.5 w-full"
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
              <Trash2 className="mr-1 w-3 h-3" />
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
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { clear } = useBacklogUI();

  const [draft, setDraft] = useState<ProjectDraft | null>(null);

  const baseDraft = getBaseProjectDraft(isCreating, activeProject);
  const currentDraft =
    draft?.projectId === baseDraft.projectId ? draft : baseDraft;

  const updateDraft = (data: ProjectDraftUpdate) => {
    setDraft({ ...currentDraft, ...data });
  };

  const handleDeleteActiveProject = () => {
    if (!activeProject) return;

    const fallbackProjectId =
      projects.find((project) => project.id !== activeProject.id)?.id ?? null;

    deleteProject(activeProject.id);
    setActiveProject(fallbackProjectId);
    clear();
    setIsCreating(fallbackProjectId === null);
    setDraft(fallbackProjectId === null ? createProjectDraft() : null);
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
    setActiveProject(id);
    if (activeProjectId === id) return;
    clear();
    setOpen(false);
  };

  const handleCreate = () => {
    if (!currentDraft.name.trim()) return;

    const id = addProject(
      currentDraft.name.trim(),
      currentDraft.color,
      currentDraft.description.trim() || undefined,
    );
    setActiveProject(id);
    setIsCreating(false);
    setDraft(null);
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
      <div className="group/project relative min-w-68">
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="justify-start gap-2 px-2 min-w-0 max-w-72 h-9"
            >
              <span
                className="rounded-full ring-2 ring-background size-2.5 shrink-0"
                style={{
                  backgroundColor: activeProject?.color ?? "var(--rule-strong)",
                }}
              />
              <span className="font-heading font-semibold text-lg truncate leading-none tracking-normal">
                {activeProject?.name ?? "Aucun projet"}
              </span>
              <ChevronDown className="opacity-55 size-4 shrink-0" />
            </Button>
          }
        />
        {activeProject?.description && !open ? (
          <div className="top-full left-0 z-40 absolute opacity-0 group-hover/project:opacity-100 mt-1 w-72 transition-opacity pointer-events-none">
            <div className="bg-popover shadow-md p-2 border rounded-md text-popover-foreground text-xs leading-relaxed">
              {activeProject.description}
            </div>
          </div>
        ) : null}
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        className="p-3 w-180 max-w-[calc(100vw-2rem)]"
      >
        <div className="gap-3 grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="mb-2 text-muted-foreground atelier-section-title">
              Projets
            </div>
            <div className="space-y-1 pr-1 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={handleStartCreate}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 border border-dashed rounded-md w-full text-left transition-colors",
                  isCreating
                    ? "border-primary/35 bg-primary/8"
                    : "border-muted-foreground/30 hover:bg-accent/55",
                )}
              >
                <Plus className="size-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm truncate">
                  Nouveau projet
                </span>
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelectProject(project.id)}
                  className={cn(
                    "flex items-start gap-2 px-2 py-1.5 border rounded-md w-full text-left transition-colors",
                    !isCreating && activeProjectId === project.id
                      ? "border-primary/25 bg-primary/8"
                      : "border-transparent hover:bg-accent/55",
                  )}
                >
                  <span
                    className="mt-1 rounded-full size-2.5 shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-sm truncate">
                      {project.name}
                    </span>
                    {project.description ? (
                      <span className="block text-muted-foreground text-xs truncate">
                        {project.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
              {projects.length === 0 ? (
                <p className="py-3 text-muted-foreground text-xs text-center">
                  Aucun projet.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 pt-3 sm:pt-0 sm:pl-3 border-t sm:border-t-0 sm:border-l min-w-0">
            <div className="text-muted-foreground atelier-section-title">
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
