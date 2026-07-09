import { useProjects } from "@/hooks/useProjects";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeRecap } from "./TimeRecap";

export function TimePage() {
  const { activeProjectId } = useProjects();

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="gap-4 grid grid-cols-[minmax(0,1fr)_26rem] 2xl:grid-cols-[minmax(0,1fr)_32rem] h-full overflow-hidden">
      <div className="gap-4 grid grid-rows-[auto_1fr] overflow-hidden">
        <TimeEntryForm projectId={activeProjectId} />
        <TimeRecap projectId={activeProjectId} />
      </div>
      <div className="p-4 rounded-md atelier-card">
        <MilestoneTimeline projectId={activeProjectId} />
      </div>
    </div>
  );
}
