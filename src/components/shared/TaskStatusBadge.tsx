import { BOARD_COLUMNS } from "@/constants/board-columns";

export function StatusBadge({ columnId }: { columnId: string }) {
  const col = BOARD_COLUMNS.find((c) => c.id === columnId);
  if (!col) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
      style={{ backgroundColor: `${col.color}20`, color: col.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: col.color }}
      />
      {col.label}
    </span>
  );
}
