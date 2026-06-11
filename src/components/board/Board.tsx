import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BOARD_COLUMNS, DONE_COLUMN_ID } from "@/constants/board-columns";
import { useProjects } from "@/hooks/useProjects";
import { useTaskActions, useTaskIds } from "@/hooks/useTasks";
import { useTaskStore } from "@/store";
import { Column } from "./Column";

export function BoardPage() {
  const { activeProjectId } = useProjects();
  const { addTask, moveTask, updateTask } = useTaskActions();
  const [newTaskTitle, setNewTaskTitle] = useState("");

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

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(activeProjectId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { operation, canceled } = event;
    if (canceled) return;

    const source = operation.source;
    const target = operation.target;
    if (!source || !target) return;

    const taskId = source.id as string;
    const overId = target.id as string;

    // Dropped on a column
    const targetColumn = BOARD_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      const columnTaskIds = useTaskStore
        .getState()
        .tasks.filter(
          (t) =>
            t.projectId === activeProjectId && t.columnId === targetColumn.id,
        );
      moveTask(taskId, targetColumn.id, columnTaskIds.length);
      if (targetColumn.id === DONE_COLUMN_ID) {
        updateTask(taskId, { done: true });
      } else {
        updateTask(taskId, { done: false });
      }
      return;
    }

    // Dropped on another task — move to same column
    const overTask = useTaskStore.getState().tasks.find((t) => t.id === overId);
    if (overTask) {
      moveTask(taskId, overTask.columnId, overTask.order);
      if (overTask.columnId === DONE_COLUMN_ID) {
        updateTask(taskId, { done: true });
      } else {
        updateTask(taskId, { done: false });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Ajouter une tâche..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          className="max-w-sm"
        />
        <Button onClick={handleAddTask} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd} onDragStart={() => {}}>
        <div className="flex flex-1 gap-4 p-2 overflow-x-auto">
          {BOARD_COLUMNS.map((column) => (
            <ColumnContainer
              key={column.id}
              column={column}
              projectId={activeProjectId}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}

function ColumnContainer({
  column,
  projectId,
}: {
  column: (typeof BOARD_COLUMNS)[number];
  projectId: string;
}) {
  const taskIds = useTaskIds(projectId, column.id);
  return <Column column={column} taskIds={taskIds} />;
}
