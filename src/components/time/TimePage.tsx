import { useProjects } from "@/hooks/useProjects";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeRecap } from "./TimeRecap";

export function TimePage() {
  const { activeProjectId } = useProjects();

  if (!activeProjectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-time-page gap-4 overflow-hidden 2xl:grid-cols-time-page-wide">
      <div className="grid grid-rows-auto-1fr gap-4 overflow-hidden">
        <TimeEntryForm projectId={activeProjectId} />
        <TimeRecap projectId={activeProjectId} />
      </div>
      <div className="atelier-card rounded-md p-4">
        <MilestoneTimeline projectId={activeProjectId} />
      </div>
    </div>
  );
}
