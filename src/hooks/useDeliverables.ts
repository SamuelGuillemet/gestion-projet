import { useShallow } from "zustand/react/shallow";
import { useDeliverableStore } from "@/store";
import { deleteDeliverableCascade } from "@/store/cascade-delete";

export function useDeliverables() {
  return useDeliverableStore(useShallow((s) => s.deliverables));
}

export function useDeliverableIds(projectId: string | null) {
  return useDeliverableStore(
    useShallow((s) =>
      s.deliverables.filter((d) => d.projectId === projectId).map((d) => d.id),
    ),
  );
}

export function useDeliverable(id: string) {
  return useDeliverableStore((s) => s.deliverables.find((d) => d.id === id));
}

export function useDeliverableActions() {
  const addDeliverable = useDeliverableStore((s) => s.addDeliverable);
  const updateDeliverable = useDeliverableStore((s) => s.updateDeliverable);
  const deleteDeliverable = deleteDeliverableCascade;
  return { addDeliverable, updateDeliverable, deleteDeliverable };
}
