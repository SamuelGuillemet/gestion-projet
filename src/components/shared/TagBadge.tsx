import type { Tag } from "@/models/tag";

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-sm border bg-card/60 px-2 py-0.5 text-xs">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </div>
  );
}
