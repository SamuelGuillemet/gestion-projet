import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/models/tag";

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-xs px-1.5 py-0"
      style={{ borderColor: tag.color, color: tag.color }}
    >
      {tag.name}
    </Badge>
  );
}
