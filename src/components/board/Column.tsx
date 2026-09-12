import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useRef } from "react";
import { BOARD_COLUMNS, type BoardColumnId } from "@/constants/board-columns";
import { cn } from "@/lib/utils";
import { Card, SortableCard } from "./Card";

interface ColumnProps {
  columnId: BoardColumnId;
  taskIds: string[];
  dragEnabled: boolean;
  onSelectTask?: (taskId: string) => void;
}

export function Column({ columnId, taskIds, dragEnabled, onSelectTask }: ColumnProps) {
  const droppableRef = useRef<HTMLDivElement>(null);
  const droppable = useDroppable({
    id: columnId,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
    element: droppableRef,
    disabled: !dragEnabled,
  });

  const column = BOARD_COLUMNS.find((col) => col.id === columnId);
  if (!column) return null;

  return (
    <div
      ref={droppableRef}
      className={cn(
        "atelier-card flex w-full min-w-80 flex-col rounded-md transition-all duration-200",
        droppable.isDropTarget &&
          "scale-[1.01] border-primary/40 bg-primary/5 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
        <span
          className="size-3 rounded-full ring-2 ring-card"
          style={{
            backgroundColor: column.color,
          }}
        />
        <span className="atelier-section-title text-foreground">{column.label}</span>
        <span className="font-data ml-auto rounded border bg-background/70 px-2 py-0.5 text-xs text-muted-foreground">
          {taskIds.length}
        </span>
      </div>

      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto p-3">
        {taskIds.map((id, index) =>
          dragEnabled ? (
            <SortableCard
              key={id}
              taskId={id}
              index={index}
              columnId={column.id}
              onSelectTask={onSelectTask}
            />
          ) : (
            <Card key={id} taskId={id} onSelectTask={onSelectTask} />
          ),
        )}
        {taskIds.length === 0 && (
          <div className="font-data rounded-md border border-dashed border-border/70 py-10 text-center text-xs text-muted-foreground/60">
            Glissez des tâches ici
          </div>
        )}
      </div>
    </div>
  );
}
