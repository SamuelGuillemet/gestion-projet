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
    <div className="space-y-4 mt-2 max-w-2xl">
      <p className="text-muted-foreground text-sm">
        Déplacez des tâches (et leurs sous-tâches) d'un projet vers un autre,
        par exemple lorsqu'une tâche a été créée dans le mauvais projet.
      </p>

      <div className="gap-3 grid grid-cols-2">
        <div>
          <label
            className="block mb-1 text-muted-foreground text-xs"
            htmlFor="migration-source"
          >
            Projet source
          </label>
          <select
            id="migration-source"
            value={sourceProjectId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="bg-background px-2 border border-input rounded-md w-full h-8 text-sm"
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
          <label
            className="block mb-1 text-muted-foreground text-xs"
            htmlFor="migration-target"
          >
            Projet cible
          </label>
          <select
            id="migration-target"
            value={targetProjectId}
            onChange={(e) => setTargetProjectId(e.target.value)}
            disabled={!sourceProjectId}
            className="bg-background disabled:opacity-50 px-2 border border-input rounded-md w-full h-8 text-sm"
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
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={
                  topLevelTasks.length > 0 &&
                  selectedIds.size === topLevelTasks.length
                }
                onCheckedChange={toggleAll}
                disabled={topLevelTasks.length === 0}
              />
              Tout sélectionner
            </label>
            <span className="text-muted-foreground text-xs">
              {selectedIds.size} sélectionnée(s)
            </span>
          </div>

          <div className="border rounded-md max-h-80 overflow-y-auto">
            {topLevelTasks.length === 0 && (
              <p className="py-6 text-muted-foreground text-xs text-center">
                Aucune tâche dans ce projet.
              </p>
            )}
            {topLevelTasks.map((task) => {
              const subtaskCount = subtaskCountByParent.get(task.id) ?? 0;
              return (
                <label
                  key={task.id}
                  className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1.5 border-b last:border-b-0 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.has(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span className="font-data text-[10px] text-muted-foreground shrink-0">
                    {getEntityReferenceLabel("tasks", task.number)}
                  </span>
                  <span
                    className={cn("flex-1 truncate", {
                      "line-through text-muted-foreground": task.done,
                    })}
                  >
                    {task.title}
                  </span>
                  {subtaskCount > 0 && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
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
        <ArrowRightLeft className="w-4 h-4" />
        Migrer{selectedIds.size > 0 ? ` ${selectedIds.size} tâche(s)` : ""}
      </Button>
    </div>
  );
}
