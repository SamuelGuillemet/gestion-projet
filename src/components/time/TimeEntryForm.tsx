import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTasksByProjectId } from "@/hooks/useTasks";
import { useTimeActions } from "@/hooks/useTimeTracking";

interface TimeEntryFormProps {
  projectId: string;
}

export function TimeEntryForm({ projectId }: TimeEntryFormProps) {
  const { addTimeEntry } = useTimeActions();
  const tasks = useTasksByProjectId(projectId);
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
    <div className="p-4 rounded-md atelier-card">
      <h3 className="mb-3 text-foreground atelier-section-title">
        Saisir du temps
      </h3>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <Label className="block mb-1 text-xs">Tâche</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="justify-between bg-background/80 w-full font-normal"
                >
                  <span className="truncate">
                    {selectedTask?.title ?? "Sélectionner une tâche"}
                  </span>
                  <ChevronDown className="opacity-50 w-4 h-4 shrink-0" />
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
          <Label className="block mb-1 text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Label className="block mb-1 text-xs">Minutes</Label>
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
