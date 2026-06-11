import { Trash2 } from "lucide-react";
import type { Deliverable } from "@/models/deliverable";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RelationManager } from "./RelationManager";

interface DeliverableDetailContentProps {
  deliverable: Deliverable;
  onUpdate: (data: Partial<Omit<Deliverable, "id" | "projectId">>) => void;
  onDelete: () => void;
}

export function DeliverableDetailContent({
  deliverable,
  onUpdate,
  onDelete,
}: DeliverableDetailContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Titre</Label>
        <Input
          value={deliverable.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Input
          value={deliverable.type ?? ""}
          onChange={(e) => onUpdate({ type: e.target.value })}
          className="mt-1"
          placeholder="Ex: Document, Code, API..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={deliverable.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-1 min-h-24"
          placeholder="Description du livrable..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Version</Label>
        <Input
          value={deliverable.version ?? ""}
          onChange={(e) => onUpdate({ version: e.target.value })}
          className="mt-1"
          placeholder="Ex: 1.0.0"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Statut</Label>
        <div className="mt-1">
          <button
            type="button"
            onClick={() => onUpdate({ done: !deliverable.done })}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              deliverable.done
                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {deliverable.done ? "✓ Livré" : "En cours"}
          </button>
        </div>
      </div>

      <RelationManager
        itemId={deliverable.id}
        projectId={deliverable.projectId}
      />

      <div className="pt-2 border-t">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          }
          title="Supprimer le livrable"
          description="Cette action est irréversible. Le livrable sera définitivement supprimé."
          onConfirm={() => {
            onDelete();
          }}
        />
      </div>
    </div>
  );
}
