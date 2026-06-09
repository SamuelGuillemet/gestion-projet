import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  HelpCircle,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOARD_COLUMNS } from "@/constants/board-columns";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import type { Deliverable } from "@/models/deliverable";
import type { Question, QuestionStatus } from "@/models/question";
import type { Task } from "@/models/task";
import { useAppStore } from "@/store";
import { TagBadge } from "../board/TagBadge";
import { TaskDetailContent } from "../board/TaskDetailContent";
import { RelationManager } from "./RelationManager";

const QUESTION_STATUSES: {
  value: QuestionStatus;
  label: string;
  color: string;
}[] = [
  { value: "to-ask", label: "À poser", color: "#6b7280" },
  { value: "pending", label: "En attente", color: "#f59e0b" },
  { value: "resolved", label: "Résolu", color: "#10b981" },
];

function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  const s =
    QUESTION_STATUSES.find((q) => q.value === status) ?? QUESTION_STATUSES[0];
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
      style={{ backgroundColor: `${s.color}20`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

type Section = "tasks" | "questions" | "deliverables";
type DetailSelection =
  | { type: "task"; id: string }
  | { type: "question"; id: string }
  | { type: "deliverable"; id: string }
  | null;

export function BacklogPage() {
  const { activeProjectId } = useProjects();
  const { tasks, addTask, deleteTask, updateTask } = useTasks(activeProjectId);
  const {
    questions,
    deliverables,
    addQuestion,
    addDeliverable,
    updateQuestion,
    deleteQuestion,
    updateDeliverable,
    deleteDeliverable,
  } = useNotes(activeProjectId);
  const tags = useAppStore((s) => s.tags);

  const [expanded, setExpanded] = useState<Record<Section, boolean>>({
    tasks: true,
    questions: true,
    deliverables: true,
  });

  const [newItems, setNewItems] = useState<Record<Section, string>>({
    tasks: "",
    questions: "",
    deliverables: "",
  });

  const [selectedDetail, setSelectedDetail] = useState<DetailSelection>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (!filterTag) return tasks;
    return tasks.filter((t) => t.tags.includes(filterTag));
  }, [tasks, filterTag]);

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  const toggle = (section: Section) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleAdd = (section: Section) => {
    const value = newItems[section].trim();
    if (!value) return;
    let id: string | undefined;
    if (section === "tasks") id = addTask(activeProjectId, value);
    if (section === "questions") id = addQuestion(activeProjectId, value);
    if (section === "deliverables") id = addDeliverable(activeProjectId, value);
    setNewItems((prev) => ({ ...prev, [section]: "" }));
    if (id)
      setSelectedDetail({
        type:
          section === "tasks"
            ? "task"
            : section === "questions"
              ? "question"
              : "deliverable",
        id,
      });
  };

  const selectedTask =
    selectedDetail?.type === "task"
      ? tasks.find((t) => t.id === selectedDetail.id)
      : null;
  const selectedQuestion =
    selectedDetail?.type === "question"
      ? questions.find((q) => q.id === selectedDetail.id)
      : null;
  const selectedDeliverable =
    selectedDetail?.type === "deliverable"
      ? deliverables.find((d) => d.id === selectedDetail.id)
      : null;

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4">
      {/* Left panel: list */}
      <div className="flex-1 overflow-y-auto space-y-4 min-w-0">
        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              Filtrer :
            </span>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setFilterTag(filterTag === tag.id ? null : tag.id)
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                  filterTag === tag.id
                    ? "border-primary bg-primary/10 text-primary"
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
            {filterTag && (
              <button
                type="button"
                onClick={() => setFilterTag(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Tasks */}
        <TreeSection
          title={`Tâches (${filteredTasks.length})`}
          expanded={expanded.tasks}
          onToggle={() => toggle("tasks")}
          accentColor="bg-blue-500"
        >
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              selected={selectedDetail?.id === task.id}
              onSelect={() => setSelectedDetail({ type: "task", id: task.id })}
              onToggleDone={() => updateTask(task.id, { done: !task.done })}
              onDelete={() => {
                deleteTask(task.id);
                if (selectedDetail?.id === task.id) setSelectedDetail(null);
              }}
            />
          ))}
          <AddItemRow
            value={newItems.tasks}
            onChange={(v) => setNewItems((prev) => ({ ...prev, tasks: v }))}
            onAdd={() => handleAdd("tasks")}
            placeholder="Nouvelle tâche..."
          />
        </TreeSection>

        {/* Questions */}
        <TreeSection
          title={`Questions (${questions.length})`}
          expanded={expanded.questions}
          onToggle={() => toggle("questions")}
          accentColor="bg-amber-500"
        >
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              selected={selectedDetail?.id === q.id}
              onSelect={() => setSelectedDetail({ type: "question", id: q.id })}
              onDelete={() => {
                deleteQuestion(q.id);
                if (selectedDetail?.id === q.id) setSelectedDetail(null);
              }}
            />
          ))}
          <AddItemRow
            value={newItems.questions}
            onChange={(v) => setNewItems((prev) => ({ ...prev, questions: v }))}
            onAdd={() => handleAdd("questions")}
            placeholder="Nouvelle question..."
          />
        </TreeSection>

        {/* Deliverables */}
        <TreeSection
          title={`Livrables (${deliverables.length})`}
          expanded={expanded.deliverables}
          onToggle={() => toggle("deliverables")}
          accentColor="bg-emerald-500"
        >
          {deliverables.map((d) => (
            <DeliverableRow
              key={d.id}
              deliverable={d}
              selected={selectedDetail?.id === d.id}
              onSelect={() =>
                setSelectedDetail({ type: "deliverable", id: d.id })
              }
              onDelete={() => {
                deleteDeliverable(d.id);
                if (selectedDetail?.id === d.id) setSelectedDetail(null);
              }}
            />
          ))}
          <AddItemRow
            value={newItems.deliverables}
            onChange={(v) =>
              setNewItems((prev) => ({ ...prev, deliverables: v }))
            }
            onAdd={() => handleAdd("deliverables")}
            placeholder="Nouveau livrable..."
          />
        </TreeSection>
      </div>

      {/* Right panel: detail */}
      {selectedDetail && (
        <div className="w-150 shrink-0 border-l pl-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Détail</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedDetail(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedTask && (
            <TaskDetailContent
              task={selectedTask}
              onUpdate={(data) => updateTask(selectedTask.id, data)}
              onDelete={() => {
                deleteTask(selectedTask.id);
                setSelectedDetail(null);
              }}
            />
          )}
          {selectedQuestion && (
            <QuestionDetailPanel
              question={selectedQuestion}
              onUpdate={(data) => updateQuestion(selectedQuestion.id, data)}
              onDelete={() => {
                deleteQuestion(selectedQuestion.id);
                setSelectedDetail(null);
              }}
            />
          )}
          {selectedDeliverable && (
            <DeliverableDetailPanel
              deliverable={selectedDeliverable}
              onUpdate={(data) =>
                updateDeliverable(selectedDeliverable.id, data)
              }
              onDelete={() => {
                deleteDeliverable(selectedDeliverable.id);
                setSelectedDetail(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// --- Utility: column status badge ---

function StatusBadge({ columnId }: { columnId: string }) {
  const col = BOARD_COLUMNS.find((c) => c.id === columnId);
  if (!col) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
      style={{ backgroundColor: `${col.color}20`, color: col.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: col.color }}
      />
      {col.label}
    </span>
  );
}

// --- Tree Section ---

function TreeSection({
  title,
  expanded,
  onToggle,
  children,
  accentColor,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="flex items-center gap-2 w-full p-3 hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <span className={`h-2 w-2 rounded-full ${accentColor}`} />
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="font-medium text-sm">{title}</span>
      </button>
      {expanded && <div className="p-3 space-y-0.5">{children}</div>}
    </div>
  );
}

// --- Task Row ---

function TaskRow({
  task,
  selected,
  onSelect,
  onToggleDone,
  onDelete,
}: {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  const tags = useAppStore((s) => s.tags);
  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <div
      className={`flex items-center gap-2 pl-4 pr-2 py-2 group rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {task.done ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>
      <span
        className={`text-sm flex-1 truncate ${task.done ? "line-through text-muted-foreground" : ""}`}
      >
        {task.title}
      </span>
      {taskTags.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {taskTags.slice(0, 2).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
      <StatusBadge columnId={task.columnId} />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

// --- Question Row ---

function QuestionRow({
  question,
  selected,
  onSelect,
  onDelete,
}: {
  question: Question;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 pl-4 pr-2 py-2 group rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <HelpCircle
        className={`h-4 w-4 shrink-0 ${question.status === "resolved" ? "text-green-500" : question.status === "pending" ? "text-amber-500" : "text-muted-foreground"}`}
      />
      <span
        className={`text-sm flex-1 truncate ${question.status === "resolved" ? "line-through text-muted-foreground" : ""}`}
      >
        {question.title}
      </span>
      {question.recipient && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-48">
          → {question.recipient}
        </span>
      )}
      <QuestionStatusBadge status={question.status} />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

// --- Deliverable Row ---

function DeliverableRow({
  deliverable,
  selected,
  onSelect,
  onDelete,
}: {
  deliverable: Deliverable;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 pl-4 pr-2 py-2 group rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <Package className="h-4 w-4 text-emerald-500 shrink-0" />
      <span className="text-sm flex-1 truncate">{deliverable.title}</span>
      {deliverable.version && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {deliverable.version}
        </span>
      )}
      {deliverable.type && (
        <span className="text-[10px] text-muted-foreground bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">
          {deliverable.type}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

// --- Question Detail Panel ---

function QuestionDetailPanel({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question;
  onUpdate: (
    data: Partial<
      Pick<
        Question,
        "title" | "description" | "recipient" | "answer" | "status"
      >
    >,
  ) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Titre</Label>
        <Input
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={question.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-1 min-h-16"
          placeholder="Détail de la question..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Destinataire</Label>
        <Input
          value={question.recipient ?? ""}
          onChange={(e) => onUpdate({ recipient: e.target.value })}
          className="mt-1"
          placeholder="Nom ou email du destinataire..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Réponse</Label>
        <Textarea
          value={question.answer ?? ""}
          onChange={(e) => onUpdate({ answer: e.target.value })}
          className="mt-1 min-h-24"
          placeholder="Réponse à la question..."
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Statut</Label>
        <div className="flex gap-1 mt-1">
          {QUESTION_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onUpdate({ status: s.value })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                question.status === s.value
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{ backgroundColor: `${s.color}20`, color: s.color }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <RelationManager itemId={question.id} projectId={question.projectId} />

      <div className="pt-2 border-t">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          }
          title="Supprimer la question"
          description="Cette action est irréversible. La question et toutes ses relations seront supprimées."
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}

// --- Deliverable Detail Panel ---

function DeliverableDetailPanel({
  deliverable,
  onUpdate,
  onDelete,
}: {
  deliverable: Deliverable;
  onUpdate: (
    data: Partial<
      Pick<Deliverable, "title" | "type" | "description" | "version" | "done">
    >,
  ) => void;
  onDelete: () => void;
}) {
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
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}

// --- Add Item Row ---

function AddItemRow({
  value,
  onChange,
  onAdd,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 pl-4 pt-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
