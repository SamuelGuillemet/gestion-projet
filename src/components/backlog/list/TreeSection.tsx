import { ChevronDown, ChevronRight } from "lucide-react";

export function TreeSection({
  title,
  expanded,
  onToggle,
  children,
  accentColor,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="rounded-md overflow-hidden atelier-card">
      <button
        type="button"
        className="flex items-center gap-2 hover:bg-accent/40 px-3 py-2.5 border-border/70 border-b w-full transition-colors"
        onClick={onToggle}
      >
        <span
          className="rounded-full w-1 h-6"
          style={{ backgroundColor: accentColor }}
        />
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="text-foreground atelier-section-title">{title}</span>
      </button>
      {expanded && <div className="space-y-1 p-2.5">{children}</div>}
    </div>
  );
}
