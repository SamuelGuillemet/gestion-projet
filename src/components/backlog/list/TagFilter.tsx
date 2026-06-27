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
    <div className="top-0 z-10 sticky flex flex-wrap items-center gap-2 bg-background/90 backdrop-blur-sm mb-1 p-2 border rounded-md">
      <span className="font-data font-semibold text-[0.62rem] text-muted-foreground uppercase tracking-[0.12em]">
        Filtrer :
      </span>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onSelectTag(selectedTag === tag.id ? null : tag.id)}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 border rounded-sm text-xs transition-colors",
            {
              "border-primary bg-primary/10 text-primary":
                selectedTag === tag.id,
              "bg-card/60 hover:border-primary/50": selectedTag !== tag.id,
            },
          )}
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
