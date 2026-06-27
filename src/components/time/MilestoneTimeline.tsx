import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMilestonesByProjectId,
  useTimeActions,
} from "@/hooks/useTimeTracking";
import { cn } from "@/lib/utils";

interface MilestoneTimelineProps {
  projectId: string;
}

export function MilestoneTimeline({ projectId }: MilestoneTimelineProps) {
  const milestones = useMilestonesByProjectId(projectId);
  const { addMilestone, deleteMilestone } = useTimeActions();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !date) return;
    addMilestone(projectId, name.trim(), date);
    setName("");
    setDate("");
  };

  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h3 className="mb-3 text-foreground atelier-section-title">Jalons</h3>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex-1">
          <Label className="text-xs">Nom</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du jalon"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div>
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} size="icon" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div>
        {sorted.length > 0 && (
          <div className="gap-2 grid sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {sorted.map((m) => {
              const isPast = new Date(m.date) < new Date();
              return (
                <div
                  key={m.id}
                  className="group flex items-start gap-3 bg-background/70 p-3 border rounded-md min-w-0"
                >
                  <span
                    className={cn(
                      "mt-1 h-3 w-3 rounded-full border-2 shrink-0",
                      isPast
                        ? "border-(--entity-deliverable) bg-(--entity-deliverable)"
                        : "border-primary bg-background",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block font-data text-muted-foreground text-xs">
                      {m.date}
                    </span>
                    <span className="block font-medium text-sm truncate">
                      {m.name}
                    </span>
                  </div>
                  <ConfirmDialog
                    triggerClassName="inline-flex"
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    }
                    title="Supprimer le jalon"
                    description="Cette action est irréversible. Le jalon sera définitivement supprimé."
                    onConfirm={() => deleteMilestone(m.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
