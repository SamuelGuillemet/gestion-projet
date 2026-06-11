import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTimeActions } from "@/hooks/useTimeTracking";
import { useTaskStore } from "@/store";

interface TimeEntryFormProps {
  projectId: string;
}

export function TimeEntryForm({ projectId }: TimeEntryFormProps) {
  const { addTimeEntry } = useTimeActions();
  const tasks = useTaskStore(
    useShallow((s) => s.tasks.filter((t) => t.projectId === projectId)),
  );
  const [taskId, setTaskId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [minutes, setMinutes] = useState("");

  const selectedTask = tasks.find((t) => t.id === taskId);

  const handleSubmit = () => {
    if (!taskId || !date || !minutes) return;
    addTimeEntry(taskId, projectId, date, Number(minutes));
    setMinutes("");
  };

  return (
    <div>
      <h3 className="font-semibold text-base mb-3">Saisir du temps</h3>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-xs mb-1 block">Tâche</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {selectedTask?.title ?? "Sélectionner une tâche"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-75">
              {tasks.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setTaskId(t.id)}>
                  <span className="truncate">{t.title}</span>
                </DropdownMenuItem>
              ))}
              {tasks.length === 0 && (
                <DropdownMenuItem disabled>Aucune tâche</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Label className="text-xs mb-1 block">Minutes</Label>
          <Input
            type="number"
            min={0}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <Button onClick={handleSubmit}>Ajouter</Button>
      </div>
    </div>
  );
}
