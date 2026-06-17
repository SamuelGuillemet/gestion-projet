import { useShallow } from "zustand/react/shallow";
import { useTimeStore } from "@/store";

/** Returns all time entries. */
export function useTimeEntries() {
  return useTimeStore(useShallow((s) => s.timeEntries));
}

/** Returns time entries for a project. */
export function useTimeEntriesByProjectId(projectId: string | null) {
  return useTimeStore(
    useShallow((s) => s.timeEntries.filter((e) => e.projectId === projectId)),
  );
}

/** Returns time entries for a task. */
export function useTimeEntriesByTaskId(taskId: string | null) {
  return useTimeStore(
    useShallow((s) => s.timeEntries.filter((e) => e.taskId === taskId)),
  );
}

/** Returns milestones for a project. */
export function useMilestonesByProjectId(projectId: string | null) {
  return useTimeStore(
    useShallow((s) => s.milestones.filter((m) => m.projectId === projectId)),
  );
}

/** Returns time action functions only (stable references). */
export function useTimeActions() {
  const addTimeEntry = useTimeStore((s) => s.addTimeEntry);
  const updateTimeEntry = useTimeStore((s) => s.updateTimeEntry);
  const deleteTimeEntry = useTimeStore((s) => s.deleteTimeEntry);
  const addMilestone = useTimeStore((s) => s.addMilestone);
  const updateMilestone = useTimeStore((s) => s.updateMilestone);
  const deleteMilestone = useTimeStore((s) => s.deleteMilestone);
  return {
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
