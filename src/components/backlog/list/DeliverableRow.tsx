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
        "group flex items-center gap-2 rounded-md border border-l-2 border-l-(--entity-deliverable)! py-2 pr-2 pl-3 transition-colors",
        {
          "border-primary/25 bg-primary/7": selected,
          "border-transparent hover:hover:bg-accent/45": !selected,
        },
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        onClick={onSelect}
      >
        <Package
          className={cn("h-4 w-4 shrink-0", {
            "text-emerald-500": deliverable.done,
            "text-muted-foreground": !deliverable.done,
          })}
        />
        <span className="font-data shrink-0 text-[10px] text-muted-foreground">
          !{deliverable.number}
        </span>
        <span
          className={cn("flex-1 truncate text-sm", {
            "text-muted-foreground line-through": deliverable.done,
          })}
        >
          {deliverable.title}
        </span>
        {deliverable.version && (
          <span className="font-data rounded-sm border bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {deliverable.version}
          </span>
        )}
        {deliverable.type && (
          <span className="rounded-sm border border-(--entity-deliverable)/25 bg-(--entity-deliverable)/10 px-1.5 py-0.5 text-[10px] text-(--entity-deliverable)">
            {deliverable.type}
          </span>
        )}
      </button>
      <ConfirmDialog
        triggerClassName="inline-flex"
        stopPropagation
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
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
