import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { BOARD_COLUMNS, type BoardColumnId } from "@/constants/board-columns";
import { SortableCard } from "./Card";

interface ColumnProps {
  columnId: BoardColumnId;
  taskIds: string[];
}

export function Column({ columnId, taskIds }: ColumnProps) {
  const droppable = useDroppable({
    id: columnId,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
  });

  const column = BOARD_COLUMNS.find((col) => col.id === columnId);
  if (!column) return null;

  return (
    <div
      ref={droppable.ref}
      className={`atelier-card flex w-full min-w-80 flex-col rounded-md transition-all duration-200 ${
        droppable.isDropTarget
          ? "scale-[1.01] border-primary/40 bg-primary/5 ring-2 ring-primary/30"
          : ""
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-border/70 border-b">
        <span
          className="rounded-full ring-2 ring-card size-3"
          style={{
            backgroundColor: column.color,
          }}
        />
        <span className="text-foreground atelier-section-title">
          {column.label}
        </span>
        <span className="bg-background/70 ml-auto px-2 py-0.5 border rounded font-data text-muted-foreground text-xs">
          {taskIds.length}
        </span>
      </div>

      <div className="flex-1 space-y-2.5 p-3 overflow-y-auto no-scrollbar">
        {taskIds.map((id, index) => (
          <SortableCard
            key={id}
            taskId={id}
            index={index}
            columnId={column.id}
          />
        ))}
        {taskIds.length === 0 && (
          <div className="py-10 border border-border/70 border-dashed rounded-md font-data text-muted-foreground/60 text-xs text-center">
            Glissez des tâches ici
          </div>
        )}
      </div>
    </div>
  );
}
