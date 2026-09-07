import { CheckCircle2, Circle, Clock, Link2, Plus, Search, Trash2, Unlink, X } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { BOARD_COLUMNS } from "@/constants/board-columns";
import { PRIORITY_OPTIONS, SIZE_OPTIONS } from "@/constants/task-options";
import { useEntityNavigation } from "@/hooks/useEntityReferenceNavigation";
import { useTags } from "@/hooks/useTags";
import { useSubtasks, useTask, useTaskActions, useTasksByProjectId } from "@/hooks/useTasks";
import {
  useTimeActions,
  useTimeEntriesByTaskId,
  useTimeEntriesByTaskIds,
} from "@/hooks/useTimeTracking";
import { getEntityReferenceLabel } from "@/lib/entity-references";
import { formatMinutes } from "@/lib/time";
import { cn, generateId } from "@/lib/utils";
import type { CheckItem } from "@/models/shared";
import type { Task } from "@/models/task";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { HighlightLinks } from "./HighlightLinks";
import { RelationManager } from "./RelationManager";

interface TaskDetailContentProps {
  task: Task;
  onUpdate: (data: Partial<Omit<Task, "id" | "projectId">>) => void;
  onDelete: () => void;
}

const getEntryDateString = () => new Date().toISOString().slice(0, 10);

export function TaskDetailContent({ task, onUpdate, onDelete }: TaskDetailContentProps) {
  const { tags } = useTags();
  const subtasks = useSubtasks(task.id);
  const taskTimeEntries = useTimeEntriesByTaskId(task.id);
  const subtaskTimeEntries = useTimeEntriesByTaskIds(subtasks.map((s) => s.id));
  const { addTimeEntry } = useTimeActions();

  const [entryDate, setEntryDate] = useState(getEntryDateString);
  const [entryMinutes, setEntryMinutes] = useState("");

  const totalMinutes = [...taskTimeEntries, ...subtaskTimeEntries].reduce(
    (sum, e) => sum + e.minutes,
    0,
  );
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
      checks: [...(task.checks ?? []), { id: generateId(), title, done: false }],
    });
  };

  const updateCheck = (checkId: string, data: Partial<CheckItem>) => {
    onUpdate({
      checks: task.checks?.map((check) => (check.id === checkId ? { ...check, ...data } : check)),
    });
  };

  const deleteCheck = (checkId: string) => {
    onUpdate({ checks: task.checks?.filter((check) => check.id !== checkId) });
  };

  return (
    <>
      <div className="flex grow flex-col gap-4">
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
            className="mt-1 field-sizing-content min-h-24"
            placeholder="Ajouter une description..."
          />
          <HighlightLinks
            text={task.description}
            projectId={task.projectId}
            className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground"
          />
        </div>

        <ChecksList
          checks={task.checks ?? []}
          onUpdate={updateCheck}
          onDelete={deleteCheck}
          onAdd={addCheck}
        />

        <div>
          <Label className="text-xs text-muted-foreground">Statut</Label>
          <div className="mt-1 flex flex-wrap gap-1">
            {BOARD_COLUMNS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => onUpdate({ columnId: col.id, done: col.id === "done" })}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  task.columnId === col.id
                    ? "ring-2 ring-offset-1"
                    : "border border-muted-foreground/20 opacity-60 hover:opacity-100",
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
          <Label className="text-xs text-muted-foreground">Tags ({task.tags.length})</Label>
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border bg-card/60 px-2 py-0.5 text-xs transition-colors",
                  taskTagIds.has(tag.id)
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/50",
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <RelationManager itemId={task.id} projectId={task.projectId} />

        <SubtasksSection task={task} />

        <div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1 text-xs text-muted-foreground">
              Temps passé
            </Label>
            {totalMinutes > 0 && (
              <span className="flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
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
          <Label className="text-xs text-muted-foreground">Échéance</Label>
          <Input
            type="date"
            value={task.dueDate ?? ""}
            onChange={(e) => onUpdate({ dueDate: e.target.value })}
            className="mt-1 h-8"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Priorité</Label>
          <div className="mt-1 flex flex-wrap gap-1">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onUpdate({
                    priority: task.priority === option.value ? undefined : option.value,
                  })
                }
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  task.priority === option.value
                    ? "ring-2 ring-offset-1"
                    : "border border-muted-foreground/20 opacity-60 hover:opacity-100",
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
          <Label className="text-xs text-muted-foreground">Taille</Label>
          <div className="mt-1 flex flex-wrap gap-1">
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
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  task.size === option.value
                    ? "ring-2 ring-offset-1"
                    : "border border-muted-foreground/20 opacity-60 hover:opacity-100",
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
      <div className="mt-4 border-t py-2">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-1 h-3 w-3" />
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

function SubtasksSection({ task }: { task: Task }) {
  const subtasks = useSubtasks(task.id);
  const parent = useTask(task.parentTaskId ?? "");
  const projectTasks = useTasksByProjectId(task.projectId);
  const { addSubtask, deleteTask, setTaskParent } = useTaskActions();
  const openEntity = useEntityNavigation();
  const [title, setTitle] = useState("");
  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");

  const normalizedSearch = parentSearch.trim().toLocaleLowerCase();
  const parentCandidates = projectTasks
    .filter(
      (candidate) =>
        candidate.id !== task.id &&
        !candidate.parentTaskId &&
        (normalizedSearch === "" ||
          candidate.title.toLocaleLowerCase().includes(normalizedSearch) ||
          getEntityReferenceLabel("tasks", candidate.number)
            .toLocaleLowerCase()
            .includes(normalizedSearch)),
    )
    .toSorted((left, right) => left.number - right.number);

  if (task.parentTaskId) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">Tâche parente</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setTaskParent(task.id)}
          >
            <Unlink className="size-3.5" />
            Détacher
          </Button>
        </div>
        {parent ? (
          <button
            type="button"
            className="group mt-2 flex w-full items-center gap-2 rounded-md border py-2 pr-3 pl-3 text-left transition-colors hover:bg-accent/45"
            onClick={() => openEntity({ type: "tasks", id: parent.id })}
          >
            <span className="shrink-0 text-muted-foreground">
              {parent.done ? (
                <CheckCircle2 className="size-4 text-green-500" />
              ) : (
                <Circle className="size-4" />
              )}
            </span>
            <span className="font-data shrink-0 text-xs text-muted-foreground">
              {getEntityReferenceLabel("tasks", parent.number)}
            </span>
            <span
              className={cn("flex-1 truncate text-sm", {
                "text-muted-foreground line-through": parent.done,
              })}
            >
              {parent.title}
            </span>
            <StatusBadge columnId={parent.columnId} />
          </button>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">La tâche parente est introuvable.</p>
        )}
      </div>
    );
  }

  const add = () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    addSubtask(task.id, nextTitle);
    setTitle("");
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">Sous-tâches</Label>
        <div className="flex items-center gap-2">
          <span className="font-data text-xs text-muted-foreground">
            {subtasks.filter((subtask) => subtask.done).length}/{subtasks.length}
          </span>
          {subtasks.length === 0 ? (
            <Popover
              open={parentPickerOpen}
              onOpenChange={(open) => {
                setParentPickerOpen(open);
                if (!open) setParentSearch("");
              }}
            >
              <PopoverTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs">
                    <Link2 className="size-3.5" />
                    Relier
                  </Button>
                }
              />
              <PopoverContent align="end" className="w-80">
                <Label className="text-xs">Choisir une tâche parente</Label>
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={parentSearch}
                    onChange={(event) => setParentSearch(event.target.value)}
                    placeholder="Rechercher par référence ou titre..."
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {parentCandidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent"
                      onClick={() => {
                        if (setTaskParent(task.id, candidate.id)) {
                          setParentPickerOpen(false);
                          setParentSearch("");
                        }
                      }}
                    >
                      <span className="font-data shrink-0 text-xs text-muted-foreground">
                        {getEntityReferenceLabel("tasks", candidate.number)}
                      </span>
                      <span className="flex-1 truncate text-sm">{candidate.title}</span>
                      <StatusBadge columnId={candidate.columnId} />
                    </button>
                  ))}
                  {parentCandidates.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                      Aucune tâche parente disponible.
                    </p>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>
      <div className="mt-2 space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="group flex items-center gap-1 rounded-md border p-1 transition-colors hover:bg-accent/45"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 px-1 py-0.5 text-left"
              onClick={() => openEntity({ type: "tasks", id: subtask.id })}
            >
              {subtask.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-data shrink-0 text-xs text-muted-foreground">
                {getEntityReferenceLabel("tasks", subtask.number)}
              </span>
              <span
                className={cn("flex-1 truncate text-sm", {
                  "text-muted-foreground line-through": subtask.done,
                })}
              >
                {subtask.title}
              </span>
              <StatusBadge columnId={subtask.columnId} />
            </button>
            <ConfirmDialog
              stopPropagation
              triggerClassName="ml-auto inline-flex shrink-0"
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-60 transition-opacity hover:opacity-100"
                  aria-label={`Supprimer la sous-tâche ${subtask.title}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
              title="Supprimer la sous-tâche"
              description="Cette action supprimera également son temps et ses relations."
              onConfirm={() => deleteTask(subtask.id)}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && add()}
            placeholder="Nouvelle sous-tâche..."
            className="h-8 text-sm"
          />
          <Button type="button" variant="outline" size="icon" className="h-8" onClick={add}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
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
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">
          Checks ({checks.filter((check) => check.done).length}/{checks.length})
        </Label>
      </div>
      <div className="mt-1 space-y-2">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2">
            <Checkbox
              aria-label={`Marquer le check "${check.title}" comme ${check.done ? "non fait" : "fait"}`}
              checked={check.done}
              onCheckedChange={(e) => onUpdate(check.id, { done: e })}
              className="size-4 shrink-0 accent-primary"
            />
            <Input
              value={check.title}
              onChange={(e) => onUpdate(check.id, { title: e.target.value })}
              className={cn("h-8 text-sm", {
                "text-muted-foreground line-through": check.done,
              })}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 gap-1.5"
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
            className="h-8 gap-1.5"
            onClick={addCheck}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
