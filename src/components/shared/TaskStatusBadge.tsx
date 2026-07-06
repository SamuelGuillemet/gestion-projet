import { BOARD_COLUMNS } from "@/constants/board-columns";

export function StatusBadge({ columnId }: { columnId: string }) {
  const col = BOARD_COLUMNS.find((c) => c.id === columnId);
  if (!col) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium text-[10px] shrink-0"
      style={{
        backgroundColor: `${col.color}10`,
        color: col.color,
        border: `1px solid ${col.color}40`,
      }}
    >
      {col.label}
    </span>
  );
}
