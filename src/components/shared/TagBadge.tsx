import type { Tag } from "@/models/tag";

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-card/60 px-2 py-0.5 border rounded-sm text-xs">
      <span
        className="rounded-full w-2 h-2"
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
    </div>
  );
}
