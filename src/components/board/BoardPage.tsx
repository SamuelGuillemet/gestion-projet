import type { DragStartEvent } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import {
  countActiveFilters,
  useFilteredTaskIds,
  useTaskFilters,
} from "@/components/task-filters/task-filters";
import { TaskFilterBar } from "@/components/task-filters/TaskFilterDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEmptyRecordOfColumns } from "@/constants/board-columns";
import { useProjects } from "@/hooks/useProjects";
import { useTaskActions, useTaskColumnRecord } from "@/hooks/useTasks";
import { CardDetail } from "./CardDetail";
import { Column } from "./Column";

export function BoardPage() {
  const { activeProjectId } = useProjects();
  const { addTask, moveTask } = useTaskActions();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { filters, updateFilters, clearFilters } = useTaskFilters(activeProjectId ?? "", "kanban");
  const filtersActive = countActiveFilters(filters) > 0;

  const allTaskColumns = useTaskColumnRecord(activeProjectId);
  const visibleTaskIds = new Set(useFilteredTaskIds(Object.values(allTaskColumns).flat(), filters));
  const taskColumns = getEmptyRecordOfColumns();
  for (const [columnId, taskIds] of Object.entries(allTaskColumns)) {
    taskColumns[columnId] = taskIds.filter((taskId) => visibleTaskIds.has(taskId));
  }

  if (!activeProjectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">Aucun projet sélectionné</p>
          <p className="text-sm">Créez ou sélectionnez un projet pour commencer.</p>
        </div>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(activeProjectId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleDragEnd = (event: DragEndEvent) => moveTask(move(allTaskColumns, event));

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <div className="atelier-card flex flex-wrap items-center justify-between gap-2 rounded-md p-3">
          <Input
            placeholder="Ajouter une tâche..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="h-9 max-w-md bg-background/80"
          />
          <Button
            onClick={handleAddTask}
            size="sm"
            className="h-9 gap-1.5"
            disabled={!newTaskTitle.trim()}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
          <div className="flex-1"></div>
          <TaskFilterBar
            filters={filters}
            updateFilters={updateFilters}
            clearFilters={clearFilters}
          />
        </div>

        <DragAndDropWrapper onDragEnd={handleDragEnd}>
          <div className="flex flex-1 gap-3 overflow-x-hidden pb-2">
            {Object.entries(taskColumns).map(([columnId, taskIds]) => {
              return (
                <Column
                  key={columnId}
                  columnId={columnId}
                  taskIds={taskIds}
                  dragEnabled={!filtersActive}
                  onSelectTask={setSelectedTaskId}
                />
              );
            })}
          </div>
        </DragAndDropWrapper>
      </div>
      {selectedTaskId && (
        <CardDetail
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}
    </>
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
    if (sourceElement && prevParent && sourceElement.parentElement !== prevParent) {
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
