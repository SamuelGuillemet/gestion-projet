import type { ReactNode } from "react";
import type { Project } from "@/models/project";

export function SectionTitle({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-primary atelier-section-title">
      {icon}
      {label}
    </h2>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 py-8 border border-border/70 border-dashed rounded-md text-muted-foreground text-sm text-center">
      {children}
    </div>
  );
}

export function ProjectName({
  project,
}: {
  project: Project | undefined | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0 text-muted-foreground text-xs">
      <span
        className="rounded-full size-2 shrink-0"
        style={{ backgroundColor: project?.color ?? "#888" }}
      />
      <span className="truncate">{project?.name ?? "Projet supprimé"}</span>
    </span>
  );
}
