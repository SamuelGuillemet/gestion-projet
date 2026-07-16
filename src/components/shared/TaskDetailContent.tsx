import { Clock, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOARD_COLUMNS } from "@/constants/board-columns";
import { PRIORITY_OPTIONS, SIZE_OPTIONS } from "@/constants/task-options";
import { useTags } from "@/hooks/useTags";
import {
  useTimeActions,
  useTimeEntriesByTaskId,
} from "@/hooks/useTimeTracking";
import { formatMinutes } from "@/lib/time";
import { cn, generateId } from "@/lib/utils";
import type { CheckItem } from "@/models/shared";
import type { Task } from "@/models/task";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { HighlightLinks } from "./HighlightLinks";
import { RelationManager } from "./RelationManager";

interface TaskDetailContentProps {
  task: Task;
  onUpdate: (data: Partial<Omit<Task, "id" | "projectId">>) => void;
  onDelete: () => void;
}

const getEntryDateString = () => new Date().toISOString().slice(0, 10);

export function TaskDetailContent({
  task,
  onUpdate,
  onDelete,
}: TaskDetailContentProps) {
  const { tags } = useTags();
  const taskTimeEntries = useTimeEntriesByTaskId(task.id);
  const { addTimeEntry } = useTimeActions();

  const [entryDate, setEntryDate] = useState(getEntryDateString);
  const [entryMinutes, setEntryMinutes] = useState("");

  const totalMinutes = taskTimeEntries.reduce((sum, e) => sum + e.minutes, 0);
  const taskTagIds = new Set(task.tags);

  const handleAddTime = () => {
    if (!entryDate || !entryMinutes) return;
    addTimeEntry(task.id, task.projectId, entryDate, Number(entryMinutes));
    // To trigger updatedAt timestamp update for the task
    onUpdate({});
    setEntryMinutes("");
  };

  const toggleTag = (tagId: string) => {
    const newTags = taskTagIds.has(tagId)
      ? task.tags.filter((id) => id !== tagId)
      : [...task.tags, tagId];
    onUpdate({ tags: newTags });
  };

  const addCheck = (title: string) => {
    onUpdate({
      checks: [
        ...(task.checks ?? []),
        { id: generateId(), title, done: false },
      ],
    });
  };

  const updateCheck = (checkId: string, data: Partial<CheckItem>) => {
    onUpdate({
      checks: task.checks?.map((check) =>
        check.id === checkId ? { ...check, ...data } : check,
      ),
    });
  };

  const deleteCheck = (checkId: string) => {
    onUpdate({ checks: task.checks?.filter((check) => check.id !== checkId) });
  };

  return (
    <>
      <div className="flex flex-col gap-4 grow">
        <div>
          <Label className="text-muted-foreground text-xs">Titre</Label>
          <Input
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Description</Label>
          <Textarea
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="mt-1 min-h-24 field-sizing-content"
            placeholder="Ajouter une description..."
          />
          <HighlightLinks
            text={task.description}
            projectId={task.projectId}
            className="mt-1 text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap"
          />
        </div>

        <ChecksList
          checks={task.checks ?? []}
          onUpdate={updateCheck}
          onDelete={deleteCheck}
          onAdd={addCheck}
        />

        <div>
          <Label className="text-muted-foreground text-xs">Statut</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {BOARD_COLUMNS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() =>
                  onUpdate({ columnId: col.id, done: col.id === "done" })
                }
                className={cn(
                  "px-2 py-1 rounded font-medium text-xs transition-colors",
                  task.columnId === col.id
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100 border border-muted-foreground/20",
                )}
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
          <Label className="text-muted-foreground text-xs">
            Tags ({task.tags.length})
          </Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1 bg-card/60 px-2 py-0.5 border rounded-sm text-xs transition-colors",
                  taskTagIds.has(tag.id)
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/50",
                )}
              >
                <span
                  className="rounded-full w-2 h-2"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <RelationManager itemId={task.id} projectId={task.projectId} />

        <div>
          <div className="flex justify-between items-center">
            <Label className="flex items-center gap-1 text-muted-foreground text-xs">
              Temps passé
            </Label>
            {totalMinutes > 0 && (
              <span className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3" />
                {formatMinutes(totalMinutes)}
              </span>
            )}
          </div>
          <div className="flex items-end gap-2">
            <div>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <InputGroup className="w-30">
              <InputGroupInput
                type="number"
                min={0}
                value={entryMinutes}
                onChange={(e) => setEntryMinutes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTime()}
                className="h-8 text-xs"
                placeholder="30"
              />
              <InputGroupAddon align="inline-end">
                <span> min(s)</span>
              </InputGroupAddon>
            </InputGroup>
            <Button size="sm" className="h-8" onClick={handleAddTime}>
              Ajouter
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Échéance</Label>
          <Input
            type="date"
            value={task.dueDate}
            onChange={(e) => onUpdate({ dueDate: e.target.value })}
            className="mt-1 h-8"
          />
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Priorité</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onUpdate({
                    priority:
                      task.priority === option.value ? undefined : option.value,
                  })
                }
                className={cn(
                  "px-2 py-1 rounded font-medium text-xs transition-colors",
                  task.priority === option.value
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100 border border-muted-foreground/20",
                )}
                style={{
                  backgroundColor: `${option.color}20`,
                  color: option.color,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Taille</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onUpdate({
                    size: task.size === option.value ? undefined : option.value,
                  })
                }
                className={cn(
                  "px-2 py-1 rounded font-medium text-xs transition-colors",
                  task.size === option.value
                    ? "ring-2 ring-offset-1"
                    : "opacity-60 hover:opacity-100 border border-muted-foreground/20",
                )}
                style={{
                  backgroundColor: `${option.color}20`,
                  color: option.color,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 py-2 border-t">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-1 w-3 h-3" />
              Supprimer
            </Button>
          }
          title="Supprimer la tâche"
          description="Cette action est irréversible. La tâche et toutes ses relations seront supprimées."
          onConfirm={onDelete}
        />
      </div>
    </>
  );
}

function ChecksList({
  checks,
  onAdd,
  onUpdate,
  onDelete,
}: {
  checks: CheckItem[];
  onAdd: (title: string) => void;
  onUpdate: (checkId: string, data: Partial<CheckItem>) => void;
  onDelete: (checkId: string) => void;
}) {
  const [newCheckTitle, setNewCheckTitle] = useState("");

  const addCheck = () => {
    const title = newCheckTitle.trim();
    if (!title) return;

    onAdd(title);
    setNewCheckTitle("");
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-2">
        <Label className="text-muted-foreground text-xs">
          Checks ({checks.filter((check) => check.done).length}/{checks.length})
        </Label>
      </div>
      <div className="space-y-2 mt-1">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              aria-label={`Marquer le check "${check.title}" comme ${check.done ? "non fait" : "fait"}`}
              checked={check.done}
              onChange={(e) => onUpdate(check.id, { done: e.target.checked })}
              className="size-4 accent-primary shrink-0"
            />
            <Input
              value={check.title}
              onChange={(e) => onUpdate(check.id, { title: e.target.value })}
              className={cn("h-8 text-sm", {
                "line-through text-muted-foreground": check.done,
              })}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="gap-1.5 h-8"
              onClick={() => onDelete(check.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Input
            value={newCheckTitle}
            onChange={(e) => setNewCheckTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCheck()}
            placeholder="Ajouter un check..."
            className="h-8 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="gap-1.5 h-8"
            onClick={addCheck}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
