import { Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
        "group flex items-center gap-2 py-2 pr-2 pl-3 border border-l-2 border-l-(--entity-deliverable)! rounded-md transition-colors cursor-pointer",
        {
          "border-primary/25 bg-primary/7": selected,
          "border-transparent hover:hover:bg-accent/45": !selected,
        },
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <Package
        className={cn("w-4 h-4 shrink-0", {
          "text-emerald-500": deliverable.done,
          "text-muted-foreground": !deliverable.done,
        })}
      />
      <span className="font-data text-[10px] text-muted-foreground shrink-0">
        !{deliverable.number}
      </span>
      <span
        className={cn("flex-1 text-sm truncate", {
          "line-through text-muted-foreground": deliverable.done,
        })}
      >
        {deliverable.title}
      </span>
      {deliverable.version && (
        <span className="bg-background/70 px-1.5 py-0.5 border rounded-sm font-data text-[10px] text-muted-foreground">
          {deliverable.version}
        </span>
      )}
      {deliverable.type && (
        <span className="bg-(--entity-deliverable)/10 px-1.5 py-0.5 rounded-sm text-[10px] text-(--entity-deliverable) border border-(--entity-deliverable)/25">
          {deliverable.type}
        </span>
      )}
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        }
        title="Supprimer le livrable"
        description="Cette action est irréversible. Le livrable sera définitivement supprimé."
        onConfirm={() => {
          deleteDeliverable(deliverableId);
          clearIfSelected(deliverableId);
        }}
      />
    </div>
  );
}
