import type { ReactNode } from "react";
import type { Project } from "@/models/project";

export function SectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <h2 className="atelier-section-title flex items-center gap-2 text-primary">
      {icon}
      {label}
    </h2>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-md border border-dashed border-border/70 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function ProjectName({ project }: { project: Project | undefined | null }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: project?.color ?? "#888" }}
      />
      <span className="truncate">{project?.name ?? "Projet supprimé"}</span>
    </span>
  );
}
