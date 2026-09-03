import type { DragStartEvent } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { TaskFilterBar } from "@/components/task-filters/TaskFilterDrawer";
import {
  countActiveFilters,
  useFilteredTaskIds,
  useTaskFilters,
} from "@/components/task-filters/task-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmptyRecordOfColumns } from "@/constants/board-columns";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { useTaskActions, useTaskColumnRecord } from "@/hooks/useTasks";
import { Column } from "./Column";

export function BoardPage() {
  const { activeProjectId } = useProjects();
  const allTaskColumns = useTaskColumnRecord(activeProjectId);
  const { tags } = useTags();
  const { addTask, moveTask } = useTaskActions();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { filters, updateFilters, clearFilters } = useTaskFilters(
    activeProjectId ?? "",
    tags,
  );

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        <div className="space-y-2 text-center">
          <p className="font-medium text-lg">Aucun projet sélectionné</p>
          <p className="text-sm">
            Créez ou sélectionnez un projet pour commencer.
          </p>
        </div>
      </div>
    );
  }

  const visibleTaskIds = new Set(
    useFilteredTaskIds(Object.values(allTaskColumns).flat(), filters),
  );
  const taskColumns = getEmptyRecordOfColumns();
  for (const [columnId, taskIds] of Object.entries(allTaskColumns)) {
    taskColumns[columnId] = taskIds.filter((taskId) =>
      visibleTaskIds.has(taskId),
    );
  }
  const filtersActive = countActiveFilters(filters) > 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(activeProjectId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleDragEnd = (event: DragEndEvent) =>
    moveTask(move(allTaskColumns, event));

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap justify-between items-center gap-2 p-3 rounded-md atelier-card">
        <Input
          placeholder="Ajouter une tâche..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          className="bg-background/80 max-w-md h-9"
        />
        <Button
          onClick={handleAddTask}
          size="sm"
          className="gap-1.5 h-9"
          disabled={!newTaskTitle.trim()}
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
        <div className="flex-1"></div>
        <TaskFilterBar
          filters={filters}
          tags={tags}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
        />
      </div>

      <DragAndDropWrapper onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 pb-2 overflow-x-hidden">
          {Object.entries(taskColumns).map(([columnId, taskIds]) => {
            return (
              <Column
                key={columnId}
                columnId={columnId}
                taskIds={taskIds}
                dragEnabled={!filtersActive}
              />
            );
          })}
        </div>
      </DragAndDropWrapper>
    </div>
  );
}

/**
 * Encapslate logic related to DnD state management and workarounds for DOM mutations.
 */
function DragAndDropWrapper({
  children,
  onDragEnd,
}: {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const sourceParentRef = useRef<Element | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    sourceParentRef.current =
      // @ts-expect-error Accessing internal property to get the source parent element
      event.operation.source?.element?.parentElement || null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const sourceElement = event.operation.source?.element;
    const prevParent = sourceParentRef.current;
    sourceParentRef.current = null;
    if (
      sourceElement &&
      prevParent &&
      sourceElement.parentElement !== prevParent
    ) {
      prevParent.appendChild(sourceElement);
    }

    if (!event.canceled) {
      onDragEnd(event);
    }
  };

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropProvider>
  );
}
