import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from "@/hooks/useProjects";
import { useTaskActions, useTasksByProjectId } from "@/hooks/useTasks";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import type { Task } from "@/models/task";

const getSubtaskCountByParent = (tasks: Task[]) => {
  const counts = new Map<string, number>();

  for (const task of tasks) {
    if (!task.parentTaskId) continue;

    counts.set(task.parentTaskId, (counts.get(task.parentTaskId) ?? 0) + 1);
  }

  return counts;
};

export function TaskMigrationPanel() {
  const { projects } = useProjects();
  const { moveTasksToProject } = useTaskActions();

  const [sourceProjectId, setSourceProjectId] = useState("");
  const [targetProjectId, setTargetProjectId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sourceTasks = useTasksByProjectId(sourceProjectId || null);

  const topLevelTasks = sourceTasks
    .filter((task) => !task.parentTaskId)
    .toSorted((a, b) => a.number - b.number);

  const subtaskCountByParent = getSubtaskCountByParent(sourceTasks);

  const handleSourceChange = (id: string) => {
    setSourceProjectId(id);
    setSelectedIds(new Set());
    if (id === targetProjectId) setTargetProjectId("");
  };

  const toggleTask = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === topLevelTasks.length
        ? new Set()
        : new Set(topLevelTasks.map((task) => task.id)),
    );
  };

  const handleMigrate = () => {
    if (!targetProjectId || selectedIds.size === 0) return;
    moveTasksToProject(Array.from(selectedIds), targetProjectId);
    setSelectedIds(new Set());
  };

  const targetProjects = projects.filter((p) => p.id !== sourceProjectId);

  return (
    <div className="mt-2 max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Déplacez des tâches (et leurs sous-tâches) d'un projet vers un autre, par exemple lorsqu'une
        tâche a été créée dans le mauvais projet.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground" htmlFor="migration-source">
            Projet source
          </label>
          <select
            id="migration-source"
            value={sourceProjectId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Sélectionner...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground" htmlFor="migration-target">
            Projet cible
          </label>
          <select
            id="migration-target"
            value={targetProjectId}
            onChange={(e) => setTargetProjectId(e.target.value)}
            disabled={!sourceProjectId}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            {targetProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sourceProjectId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={topLevelTasks.length > 0 && selectedIds.size === topLevelTasks.length}
                onCheckedChange={toggleAll}
                disabled={topLevelTasks.length === 0}
              />
              Tout sélectionner
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} sélectionnée(s)
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-md border">
            {topLevelTasks.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Aucune tâche dans ce projet.
              </p>
            )}
            {topLevelTasks.map((task) => {
              const subtaskCount = subtaskCountByParent.get(task.id) ?? 0;
              return (
                <label
                  key={task.id}
                  className="flex cursor-pointer items-center gap-2 border-b px-2 py-1.5 text-sm last:border-b-0 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedIds.has(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className="font-data shrink-0 text-[10px] text-muted-foreground">
                    {getEntityReferenceLabel("tasks", task.number)}
                  </span>
                  <span
                    className={cn("flex-1 truncate", {
                      "text-muted-foreground line-through": task.done,
                    })}
                  >
                    {task.title}
                  </span>
                  {subtaskCount > 0 && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      +{subtaskCount} sous-tâche(s)
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <Button
        onClick={handleMigrate}
        disabled={!targetProjectId || selectedIds.size === 0}
        size="sm"
      >
        <ArrowRightLeft className="h-4 w-4" />
        Migrer{selectedIds.size > 0 ? ` ${selectedIds.size} tâche(s)` : ""}
      </Button>
    </div>
  );
}
