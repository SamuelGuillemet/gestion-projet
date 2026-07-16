import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMilestonesByProjectId,
  useTimeActions,
} from "@/hooks/useTimeTracking";
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

      <div className="px-2">
        {sorted.length > 0 && (
          <div className="relative space-y-4 ml-1 pl-4 border-muted border-l-2">
            {sorted.map((m) => {
              const isPast = new Date(m.date) < new Date();
              return (
                <div key={m.id} className="group relative">
                  <div
                    className={`absolute -left-6.25 top-1 h-4 w-4 rounded-full border-2 ${
                      isPast
                        ? "border-(--entity-deliverable) bg-(--entity-deliverable)"
                        : "border-primary bg-background"
                    }`}
                  />
                  <div className="flex items-center gap-2 ml-4">
                    <span className="w-24 font-data text-muted-foreground text-xs">
                      {m.date}
                    </span>
                    <span className="font-medium text-sm">{m.name}</span>
                    <div className="grow"></div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
