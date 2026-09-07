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
    <div className="atelier-card overflow-hidden rounded-md">
      <button
        type="button"
        className="flex w-full items-center gap-2 border-b border-border/70 px-3 py-2.5 transition-colors hover:bg-accent/40"
        onClick={onToggle}
      >
        <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="atelier-section-title text-foreground">{title}</span>
      </button>
      {expanded && <div className="space-y-1 p-2.5">{children}</div>}
    </div>
  );
}
