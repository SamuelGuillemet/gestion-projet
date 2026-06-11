import { useShallow } from "zustand/react/shallow";
import { useTimeStore } from "@/store";

/** Returns time entries for a task. */
export function useTimeEntriesByTaskId(taskId: string | null) {
  return useTimeStore(
    useShallow((s) => s.timeEntries.filter((e) => e.taskId === taskId)),
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
