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
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="flex items-center gap-2 hover:bg-muted/50 p-3 w-full transition-colors"
        onClick={onToggle}
      >
        <span className={`h-2 w-2 rounded-full ${accentColor}`} />
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium text-sm">{title}</span>
      </button>
      {expanded && <div className="space-y-0.5 p-3">{children}</div>}
    </div>
  );
}
