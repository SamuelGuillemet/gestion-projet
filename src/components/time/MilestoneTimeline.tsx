import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimeTracking } from "@/hooks/useTimeTracking";

interface MilestoneTimelineProps {
  projectId: string;
}

export function MilestoneTimeline({ projectId }: MilestoneTimelineProps) {
  const { milestones, addMilestone, deleteMilestone } =
    useTimeTracking(projectId);
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
    <div className="px-2">
      <h3 className="font-medium text-sm mb-3">Jalons</h3>

      <div className="flex items-end gap-3 mb-4">
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
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {sorted.length > 0 && (
        <div className="relative ml-1 pl-4 border-l-2 border-muted space-y-4">
          {sorted.map((m) => {
            const isPast = new Date(m.date) < new Date();
            return (
              <div key={m.id} className="relative group">
                <div
                  className={`absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 ${
                    isPast
                      ? "bg-green-500 border-green-500"
                      : "bg-background border-primary"
                  }`}
                />
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-muted-foreground w-24">
                    {m.date}
                  </span>
                  <span className="text-sm font-medium">{m.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteMilestone(m.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
