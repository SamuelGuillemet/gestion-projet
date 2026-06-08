import { Clock, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOARD_COLUMNS } from "@/constants/board-columns";
import type { Task } from "@/models/task";
import { useAppStore } from "@/store";
import { RelationManager } from "../backlog/RelationManager";

interface TaskDetailContentProps {
  task: Task;
  onUpdate: (data: Partial<Omit<Task, "id" | "projectId">>) => void;
  onDelete: () => void;
}

export function TaskDetailContent({
  task,
  onUpdate,
  onDelete,
}: TaskDetailContentProps) {
  const tags = useAppStore((s) => s.tags);
  const timeEntries = useAppStore((s) => s.timeEntries);
  const addTimeEntry = useAppStore((s) => s.addTimeEntry);

  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [entryMinutes, setEntryMinutes] = useState("");

  const taskTimeEntries = useMemo(
    () => timeEntries.filter((e) => e.taskId === task.id),
    [timeEntries, task.id],
  );

  const totalMinutes = useMemo(
    () => taskTimeEntries.reduce((sum, e) => sum + e.minutes, 0),
    [taskTimeEntries],
  );

  const formatMinutes = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min}min`;
    if (min === 0) return `${h}h`;
    return `${h}h${min.toString().padStart(2, "0")}`;
  };

  const handleAddTime = () => {
    if (!entryDate || !entryMinutes) return;
    addTimeEntry(task.id, task.projectId, entryDate, Number(entryMinutes));
    setEntryMinutes("");
  };

  const toggleTag = (tagId: string) => {
    const newTags = task.tags.includes(tagId)
      ? task.tags.filter((id) => id !== tagId)
      : [...task.tags, tagId];
    onUpdate({ tags: newTags });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Titre</Label>
        <Input
          value={task.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={task.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-1 min-h-24"
          placeholder="Ajouter une description..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Statut</Label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {BOARD_COLUMNS.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() =>
                onUpdate({ columnId: col.id, done: col.id === "done" })
              }
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                task.columnId === col.id
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: `${col.color}20`,
                color: col.color,
              }}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">
          Tags ({task.tags.length})
        </Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                task.tags.includes(tag.id)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <RelationManager itemId={task.id} projectId={task.projectId} />

      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            Temps passé
          </Label>
          <span className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3" />
            {totalMinutes > 0 ? formatMinutes(totalMinutes) : "—"}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs mb-1 block">Date</Label>
            <Input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs mb-1 block">Minutes</Label>
            <Input
              type="number"
              min={0}
              value={entryMinutes}
              onChange={(e) => setEntryMinutes(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTime()}
              className="h-8 text-xs"
              placeholder="30"
            />
          </div>
          <Button size="sm" className="h-8" onClick={handleAddTime}>
            Ajouter
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          }
          title="Supprimer la tâche"
          description="Cette action est irréversible. La tâche et toutes ses relations seront supprimées."
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}
