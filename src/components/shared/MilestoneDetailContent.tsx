import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Milestone } from "@/models/milestone";

interface MilestoneDetailContentProps {
  milestone: Milestone;
  onUpdate: (
    data: Partial<Pick<Milestone, "name" | "date" | "description">>,
  ) => void;
  onDelete: () => void;
}

export function MilestoneDetailContent({
  milestone,
  onUpdate,
  onDelete,
}: MilestoneDetailContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-muted-foreground text-xs">Nom</Label>
        <Input
          value={milestone.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Date</Label>
        <Input
          type="date"
          value={milestone.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Description</Label>
        <Textarea
          value={milestone.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-1 min-h-20 field-sizing-content"
          placeholder="Ajouter une description..."
        />
      </div>

      <ConfirmDialog
        trigger={
          <Button variant="outline" className="gap-1.5 text-destructive">
            <Trash2 className="w-4 h-4" />
            Supprimer le jalon
          </Button>
        }
        title="Supprimer le jalon"
        description="Cette action est irréversible. Le jalon sera définitivement supprimé."
        onConfirm={onDelete}
      />
    </div>
  );
}
