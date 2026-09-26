import { X } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import { cn } from "@/lib/utils";

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
    <div className="sticky top-0 z-10 mb-1 flex flex-wrap items-center gap-2 rounded-md border bg-background/90 p-2 backdrop-blur-sm">
      <span className="font-data text-2xs font-semibold tracking-label text-muted-foreground uppercase">
        Filtrer :
      </span>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onSelectTag(selectedTag === tag.id ? null : tag.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs transition-colors",
            {
              "border-primary bg-primary/10 text-primary": selectedTag === tag.id,
              "bg-card/60 hover:border-primary/50": selectedTag !== tag.id,
            },
          )}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
          {tag.name}
        </button>
      ))}
      {selectedTag && (
        <button
          type="button"
          aria-label="Clear tag filter"
          onClick={() => onSelectTag(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
