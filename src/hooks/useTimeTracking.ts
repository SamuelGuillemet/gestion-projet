import { useMemo } from "react";
import { useAppStore } from "@/store";

export function useTimeTracking(projectId: string | null) {
  const timeEntries = useAppStore((s) => s.timeEntries);
  const addTimeEntry = useAppStore((s) => s.addTimeEntry);
  const updateTimeEntry = useAppStore((s) => s.updateTimeEntry);
  const deleteTimeEntry = useAppStore((s) => s.deleteTimeEntry);
  const milestones = useAppStore((s) => s.milestones);
  const addMilestone = useAppStore((s) => s.addMilestone);
  const updateMilestone = useAppStore((s) => s.updateMilestone);
  const deleteMilestone = useAppStore((s) => s.deleteMilestone);

  const projectTimeEntries = useMemo(
    () => timeEntries.filter((e) => e.projectId === projectId),
    [timeEntries, projectId],
  );

  const projectMilestones = useMemo(
    () => milestones.filter((m) => m.projectId === projectId),
    [milestones, projectId],
  );

  const totalMinutes = useMemo(
    () => projectTimeEntries.reduce((sum, e) => sum + e.minutes, 0),
    [projectTimeEntries],
  );

  return {
    timeEntries: projectTimeEntries,
    totalMinutes,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    milestones: projectMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
