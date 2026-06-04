import { useDroppable } from "@dnd-kit/react";
import type { BoardColumn } from "@/constants/board-columns";
import type { Task } from "@/models/task";
import { SortableCard } from "./Card";

interface ColumnProps {
  column: BoardColumn;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const droppable = useDroppable({ id: column.id });

  return (
    <div
      ref={droppable.ref}
      className={`flex flex-col w-full min-w-80 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-200 ${
        droppable.isDropTarget
          ? "ring-2 ring-primary/50 border-primary/30 bg-primary/5 scale-[1.01]"
          : ""
      }`}
    >
      <div className="flex items-center gap-3 p-4 border-border/30 border-b">
        <span
          className="rounded-full ring-2 ring-offset-2 ring-offset-card w-3 h-3"
          style={{
            backgroundColor: column.color,
            boxShadow: `0 0 8px ${column.color}40`,
          }}
        />
        <span className="font-semibold text-sm tracking-wide">
          {column.label}
        </span>
        <span className="bg-secondary/80 ml-auto px-2 py-0.5 rounded-full font-mono text-muted-foreground text-xs">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-2.5 p-3 overflow-y-auto">
        {tasks.map((task, index) => (
          <SortableCard key={task.id} task={task} index={index} />
        ))}
        {tasks.length === 0 && (
          <div className="py-10 border border-border/30 border-dashed rounded-xl text-muted-foreground/40 text-xs text-center">
            Glissez des tâches ici
          </div>
        )}
      </div>
    </div>
  );
}
