import { Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeliverable, useDeliverableActions } from "@/hooks/useDeliverables";
import { cn } from "@/lib/utils";
import { useBacklogUI } from "../backlog-state";

export function DeliverableRow({ deliverableId }: { deliverableId: string }) {
  const deliverable = useDeliverable(deliverableId);
  const { deleteDeliverable } = useDeliverableActions();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === deliverableId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  if (!deliverable) return null;

  const onSelect = () => select({ type: "deliverables", id: deliverableId });

  return (
    <div
      className={cn(
        "group flex items-center gap-2 py-2 pr-2 pl-4 rounded-md transition-colors cursor-pointer",
        {
          "bg-primary/5 border border-primary/20": selected,
          "hover:bg-muted/30": !selected,
        },
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <Package className="w-4 h-4 text-emerald-500 shrink-0" />
      <span className="flex-1 text-sm truncate">{deliverable.title}</span>
      {deliverable.version && (
        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
          {deliverable.version}
        </span>
      )}
      {deliverable.type && (
        <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] text-emerald-600">
          {deliverable.type}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteDeliverable(deliverableId);
          clearIfSelected(deliverableId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
