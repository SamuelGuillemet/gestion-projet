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
import { useState } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { DeliverableDetailContent } from "@/components/shared/DeliverableDetailContent";
import { QuestionDetailContent } from "@/components/shared/QuestionDetailContent";
import { QuestionStatusBadge } from "@/components/shared/QuestionStatusBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { TaskDetailContent } from "@/components/shared/TaskDetailContent";
import { StatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeliverable,
  useDeliverableIds,
  useNoteActions,
  useQuestion,
  useQuestionIds,
} from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { useTask, useTaskActions, useTaskIds } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/store";

// --- Local UI store for backlog selection (avoids parent re-renders) ---
type DetailSelection =
  | { type: "tasks"; id: string }
  | { type: "questions"; id: string }
  | { type: "deliverables"; id: string }
  | null;

interface BacklogUIState {
  selectedDetail: DetailSelection;
  select: (detail: DetailSelection) => void;
  clear: () => void;
  clearIfSelected: (id: string) => void;
}

const useBacklogUI = create<BacklogUIState>((set, get) => ({
  selectedDetail: null,
  select: (detail) => set({ selectedDetail: detail }),
  clear: () => set({ selectedDetail: null }),
  clearIfSelected: (id) => {
    if (get().selectedDetail?.id === id) set({ selectedDetail: null });
  },
}));

type Section = "tasks" | "questions" | "deliverables";

export function BacklogPage() {
  const { activeProjectId } = useProjects();
  const taskIds = useTaskIds(activeProjectId);
  const { addTask } = useTaskActions();
  const questionIds = useQuestionIds(activeProjectId);
  const deliverableIds = useDeliverableIds(activeProjectId);
  const { addQuestion, addDeliverable } = useNoteActions();
  const tags = useTagStore(useShallow((s) => s.tags));

  const select = useBacklogUI((s) => s.select);
  const hasSelection = useBacklogUI((s) => s.selectedDetail !== null);

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

  const [filterTag, setFilterTag] = useState<string | null>(null);

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  const toggle = (section: Section) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleAdd = (section: Section) => {
    const value = newItems[section].trim();
    if (!value) return;
    const action: Record<
      Section,
      (projectId: string, value: string) => string
    > = {
      tasks: addTask,
      questions: addQuestion,
      deliverables: addDeliverable,
    };
    const id = action[section](activeProjectId, value);
    setNewItems((prev) => ({ ...prev, [section]: "" }));
    if (id)
      select({
        type: section,
        id,
      });
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* Left panel: list */}
      <div className="flex-1 space-y-4 min-w-0 overflow-y-auto">
        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-muted-foreground text-xs">
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
                  className="rounded-full w-2 h-2"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
            {filterTag && (
              <button
                type="button"
                onClick={() => setFilterTag(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Tasks */}
        <TreeSection
          title={`Tâches (${taskIds.length})`}
          expanded={expanded.tasks}
          onToggle={() => toggle("tasks")}
          accentColor="bg-blue-500"
        >
          {taskIds.map((id) => (
            <TaskRow key={id} taskId={id} filterTag={filterTag} />
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
          title={`Questions (${questionIds.length})`}
          expanded={expanded.questions}
          onToggle={() => toggle("questions")}
          accentColor="bg-amber-500"
        >
          {questionIds.map((id) => (
            <QuestionRow key={id} questionId={id} />
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
          title={`Livrables (${deliverableIds.length})`}
          expanded={expanded.deliverables}
          onToggle={() => toggle("deliverables")}
          accentColor="bg-emerald-500"
        >
          {deliverableIds.map((id) => (
            <DeliverableRow key={id} deliverableId={id} />
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
      {hasSelection && <DetailPanel />}
    </div>
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
        className="flex items-center gap-2 hover:bg-muted/50 p-3 w-full transition-colors"
        onClick={onToggle}
      >
        <span className={`h-2 w-2 rounded-full ${accentColor}`} />
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium text-sm">{title}</span>
      </button>
      {expanded && <div className="space-y-0.5 p-3">{children}</div>}
    </div>
  );
}

// --- Task Row ---

function TaskRow({
  taskId,
  filterTag,
}: {
  taskId: string;
  filterTag: string | null;
}) {
  const task = useTask(taskId);
  const { deleteTask } = useTaskActions();
  const tags = useTagStore(useShallow((s) => s.tags));
  const selected = useBacklogUI((s) => s.selectedDetail?.id === taskId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  if (!task) return null;
  // Apply tag filter
  if (filterTag && !task.tags.includes(filterTag)) return null;

  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  const onSelect = () => select({ type: "tasks", id: taskId });

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
      <span className="text-muted-foreground shrink-0">
        {task.done ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </span>
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
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(taskId);
          clearIfSelected(taskId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// --- Question Row ---

function QuestionRow({ questionId }: { questionId: string }) {
  const question = useQuestion(questionId);
  const { deleteQuestion } = useNoteActions();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === questionId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  const onSelect = () => select({ type: "questions", id: questionId });

  if (!question) return null;

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
        className={cn(
          "w-4 h-4 shrink-0",
          question.status === "resolved" && "text-green-500",
          question.status === "pending" && "text-amber-500",
          question.status === "to-ask" && "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "flex-1 text-sm truncate",
          question.status === "resolved" &&
            "line-through text-muted-foreground",
        )}
      >
        {question.title}
      </span>
      {question.recipient && (
        <span className="bg-muted px-1.5 py-0.5 rounded max-w-48 text-[10px] text-muted-foreground truncate">
          → {question.recipient}
        </span>
      )}
      <QuestionStatusBadge status={question.status} />
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteQuestion(questionId);
          clearIfSelected(questionId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// --- Deliverable Row ---

function DeliverableRow({ deliverableId }: { deliverableId: string }) {
  const deliverable = useDeliverable(deliverableId);
  const { deleteDeliverable } = useNoteActions();
  const selected = useBacklogUI((s) => s.selectedDetail?.id === deliverableId);
  const select = useBacklogUI((s) => s.select);
  const clearIfSelected = useBacklogUI((s) => s.clearIfSelected);

  if (!deliverable) return null;

  const onSelect = () => select({ type: "deliverables", id: deliverableId });

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
      <Package className="w-4 h-4 text-emerald-500 shrink-0" />
      <span className="flex-1 text-sm truncate">{deliverable.title}</span>
      {deliverable.version && (
        <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
          {deliverable.version}
        </span>
      )}
      {deliverable.type && (
        <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px] text-emerald-600">
          {deliverable.type}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteDeliverable(deliverableId);
          clearIfSelected(deliverableId);
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// --- Detail Panel (subscribes to selection) ---

function DetailPanel() {
  const selectedDetail = useBacklogUI((s) => s.selectedDetail);
  const clear = useBacklogUI((s) => s.clear);

  if (!selectedDetail) return null;

  return (
    <div className="p-4 border-l w-150 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Détail</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={clear}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {selectedDetail.type === "tasks" && (
        <TaskDetailPanel taskId={selectedDetail.id} />
      )}
      {selectedDetail.type === "questions" && (
        <QuestionDetailPanel questionId={selectedDetail.id} />
      )}
      {selectedDetail.type === "deliverables" && (
        <DeliverableDetailPanel deliverableId={selectedDetail.id} />
      )}
    </div>
  );
}

// --- Task Detail Panel ---

function TaskDetailPanel({ taskId }: { taskId: string }) {
  const task = useTask(taskId);
  const { updateTask, deleteTask } = useTaskActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!task) return null;

  return (
    <TaskDetailContent
      task={task}
      onUpdate={(data) => updateTask(task.id, data)}
      onDelete={() => {
        deleteTask(task.id);
        clear();
      }}
    />
  );
}

// --- Question Detail Panel ---

function QuestionDetailPanel({ questionId }: { questionId: string }) {
  const question = useQuestion(questionId);
  const { updateQuestion, deleteQuestion } = useNoteActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!question) return null;

  return (
    <QuestionDetailContent
      question={question}
      onUpdate={(data) => updateQuestion(question.id, data)}
      onDelete={() => {
        deleteQuestion(question.id);
        clear();
      }}
    />
  );
}

// --- Deliverable Detail Panel ---

function DeliverableDetailPanel({ deliverableId }: { deliverableId: string }) {
  const deliverable = useDeliverable(deliverableId);
  const { updateDeliverable, deleteDeliverable } = useNoteActions();
  const clear = useBacklogUI((s) => s.clear);

  if (!deliverable) return null;

  return (
    <DeliverableDetailContent
      deliverable={deliverable}
      onUpdate={(data) => updateDeliverable(deliverable.id, data)}
      onDelete={() => {
        deleteDeliverable(deliverable.id);
        clear();
      }}
    />
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
    <div className="flex items-center gap-2 pt-2 pl-4">
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
        className="w-8 h-8 shrink-0"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
