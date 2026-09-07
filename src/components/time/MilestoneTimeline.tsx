import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMilestonesByProjectId, useTimeActions } from "@/hooks/useTimeTracking";
import { ConfirmDialog } from "../ui/confirm-dialog";

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

  const sorted = milestones.toSorted((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h3 className="atelier-section-title mb-3 text-foreground">Jalons</h3>

      <div className="mb-4 flex flex-wrap items-end gap-3">
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
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={handleAdd} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-2">
        {sorted.length > 0 && (
          <div className="relative ml-1 space-y-4 border-l-2 border-muted pl-4">
            {sorted.map((m) => {
              const isPast = new Date(m.date) < new Date();
              return (
                <div key={m.id} className="group relative">
                  <div
                    className={`absolute top-1 -left-6.25 h-4 w-4 rounded-full border-2 ${
                      isPast
                        ? "border-(--entity-deliverable) bg-(--entity-deliverable)"
                        : "border-primary bg-background"
                    }`}
                  />
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-data w-24 text-xs text-muted-foreground">{m.date}</span>
                    <span className="text-sm font-medium">{m.name}</span>
                    <div className="grow"></div>
                    <ConfirmDialog
                      triggerClassName="inline-flex"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                      title="Supprimer le jalon"
                      description="Cette action est irréversible. Le jalon sera définitivement supprimé."
                      onConfirm={() => deleteMilestone(m.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
