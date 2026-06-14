import { X } from "lucide-react";
import { useTags } from "@/hooks/useTags";

export function TagFilter({
  selectedTag,
  onSelectTag,
}: {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}) {
  const { tags } = useTags();

  if (!tags) return null;

  return (
    <div className="top-0 z-10 sticky flex flex-wrap items-center gap-2 bg-background p-2">
      <span className="font-medium text-muted-foreground text-xs">
        Filtrer :
      </span>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onSelectTag(selectedTag === tag.id ? null : tag.id)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
            selectedTag === tag.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:border-primary/50"
          }`}
        >
          <span
            className="rounded-full w-2 h-2"
            style={{ backgroundColor: tag.color }}
          />
          {tag.name}
        </button>
      ))}
      {selectedTag && (
        <button
          type="button"
          onClick={() => onSelectTag(null)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
