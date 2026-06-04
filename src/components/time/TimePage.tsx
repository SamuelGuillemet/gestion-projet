import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/hooks/useProjects";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeRecap } from "./TimeRecap";

export function TimePage() {
  const { activeProjectId } = useProjects();

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-8">
      <TimeEntryForm projectId={activeProjectId} />
      <Separator />
      <TimeRecap projectId={activeProjectId} />
      <Separator />
      <MilestoneTimeline projectId={activeProjectId} />
    </div>
  );
}
