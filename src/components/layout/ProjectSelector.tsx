import { Check, ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

const PROJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

export function ProjectSelector() {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProject,
    addProject,
    updateProject,
  } = useProjects();
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PROJECT_COLORS[0]);
  const [draftDescription, setDraftDescription] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    setDraftName(activeProject?.name ?? "");
    setDraftColor(activeProject?.color ?? PROJECT_COLORS[0]);
    setDraftDescription(activeProject?.description ?? "");
  }, [activeProject]);

  const handleCreate = () => {
    if (!newName.trim()) return;

    const id = addProject(
      newName.trim(),
      newColor,
      newDescription.trim() || undefined,
    );
    setNewName("");
    setNewColor(PROJECT_COLORS[0]);
    setNewDescription("");
    setActiveProject(id);
  };

  const handleSave = () => {
    if (!activeProject || !draftName.trim()) return;

    updateProject(activeProject.id, {
      name: draftName.trim(),
      color: draftColor,
      description: draftDescription.trim() || undefined,
    });
  };

  const hasChanges =
    !!activeProject &&
    (draftName !== activeProject.name ||
      draftColor !== activeProject.color ||
      draftDescription !== (activeProject.description ?? ""));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="group/project relative min-w-0">
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="justify-start gap-2 px-2 max-w-72 h-9 min-w-0"
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
          <div className="top-full left-0 z-40 absolute opacity-0 group-hover/project:opacity-100 mt-1 w-72 pointer-events-none transition-opacity">
            <div className="bg-popover shadow-md p-2 border rounded-md text-popover-foreground text-xs leading-relaxed">
              {activeProject.description}
            </div>
          </div>
        ) : null}
      </div>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-180 max-w-[calc(100vw-2rem)] p-3"
      >
        <div className="gap-3 grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="mb-2 text-muted-foreground atelier-section-title">
              Projets
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setActiveProject(project.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                    activeProjectId === project.id
                      ? "border-primary/25 bg-primary/8"
                      : "border-transparent hover:bg-accent/55",
                  )}
                >
                  <span
                    className="mt-1 rounded-full size-2.5 shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="min-w-0 flex-1">
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

            <div className="space-y-2 mt-3 pt-3 border-t">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleCreate()}
                placeholder="Nouveau projet"
                className="h-8 text-sm"
              />
              <Textarea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Description"
                className="min-h-16 text-xs resize-none"
              />
              <ProjectColorPicker value={newColor} onChange={setNewColor} />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={handleCreate}
              >
                <Plus className="size-4" />
                Créer
              </Button>
            </div>
          </div>

          <div className="space-y-3 min-w-0 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-3">
            <div className="text-muted-foreground atelier-section-title">
              Détails
            </div>
            {activeProject ? (
              <>
                <div>
                  <Label htmlFor="project-name" className="text-xs">
                    Nom
                  </Label>
                  <Input
                    id="project-name"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSave()}
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="project-description"
                    value={draftDescription}
                    onChange={(event) =>
                      setDraftDescription(event.target.value)
                    }
                    className="mt-1 min-h-24 resize-none"
                    placeholder="Description du projet"
                  />
                </div>
                <div>
                  <Label className="text-xs">Couleur</Label>
                  <ProjectColorPicker
                    value={draftColor}
                    onChange={setDraftColor}
                    className="mt-2"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={!hasChanges || !draftName.trim()}
                  onClick={handleSave}
                >
                  <Check className="size-4" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <p className="py-6 text-muted-foreground text-sm text-center">
                Sélectionnez ou créez un projet.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProjectColorPicker({
  className,
  onChange,
  value,
}: {
  className?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {PROJECT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          className={cn(
            "size-6 rounded-full border-2 transition-transform hover:scale-110",
            value === color
              ? "border-foreground scale-110"
              : "border-transparent",
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border rounded-full size-6 cursor-pointer shrink-0"
      />
    </div>
  );
}
