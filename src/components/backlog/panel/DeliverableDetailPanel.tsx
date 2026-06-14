import { DeliverableDetailContent } from "@/components/shared/DeliverableDetailContent";
import { useDeliverable, useDeliverableActions } from "@/hooks/useDeliverables";
import { useBacklogUI } from "../backlog-state";

export function DeliverableDetailPanel({
  deliverableId,
}: {
  deliverableId: string;
}) {
  const deliverable = useDeliverable(deliverableId);
  const { updateDeliverable, deleteDeliverable } = useDeliverableActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!deliverable) return null;

  return (
    <DeliverableDetailContent
      deliverable={deliverable}
      onUpdate={(data) => updateDeliverable(deliverable.id, data)}
      onDelete={() => {
        deleteDeliverable(deliverable.id);
        clear();
      }}
    />
  );
}
