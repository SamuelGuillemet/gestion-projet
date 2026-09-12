import { useState } from "react";
import { useFilteredTaskIds, useTaskFilters } from "@/components/task-filters/task-filters";
import { TaskFilterBar } from "@/components/task-filters/TaskFilterDrawer";
import { useDeliverableActions, useDeliverableIds } from "@/hooks/useDeliverables";
import { useQuestionActions, useQuestionIds } from "@/hooks/useQuestions";
import { useTaskActions, useTaskIds, useTasksByProjectId } from "@/hooks/useTasks";
import type { Task } from "@/models/task";
import { type Section, useBacklogUI } from "./backlog-state";
import { AddItemRow, DeliverableRow, QuestionRow, TaskGroupRow, TreeSection } from "./list";

interface BacklogListProps {
  activeProjectId: string;
}

// Groups filtered task ids into parent tasks with their nested subtask ids;
// a subtask whose parent got filtered out is promoted to top-level.
function buildTaskTree(taskIds: string[], allTasks: Task[]) {
  const parentIdById = new Map(allTasks.map((task) => [task.id, task.parentTaskId]));
  const taskIdSet = new Set(taskIds);
  const childrenByParent = new Map<string, string[]>();
  const topLevelIds: string[] = [];

  for (const id of taskIds) {
    const parentId = parentIdById.get(id);
    if (parentId && taskIdSet.has(parentId)) {
      childrenByParent.set(parentId, [...(childrenByParent.get(parentId) ?? []), id]);
    } else {
      topLevelIds.push(id);
    }
  }

  return topLevelIds.map((taskId) => ({
    taskId,
    subtaskIds: childrenByParent.get(taskId) ?? [],
  }));
}

export function BacklogList({ activeProjectId }: BacklogListProps) {
  const baseTaskIds = useTaskIds(activeProjectId);
  const { filters, updateFilters, clearFilters } = useTaskFilters(activeProjectId, "backlog");
  const taskIds = useFilteredTaskIds(baseTaskIds, filters);
  const projectTasks = useTasksByProjectId(activeProjectId);
  const taskTree = buildTaskTree(taskIds, projectTasks);
  const questionIds = useQuestionIds(activeProjectId);
  const deliverableIds = useDeliverableIds(activeProjectId);
  const { addTask } = useTaskActions();
  const { addQuestion } = useQuestionActions();
  const { addDeliverable } = useDeliverableActions();

  const select = useBacklogUI((s) => s.select);

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

  const toggle = (section: Section) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleAdd = (section: Section) => {
    const value = newItems[section].trim();
    if (!value) return;

    const action = {
      tasks: addTask,
      questions: addQuestion,
      deliverables: addDeliverable,
    };
    const id = action[section](activeProjectId, value);

    setNewItems((prev) => ({ ...prev, [section]: "" }));

    select({ type: section, id });
  };

  return (
    <div className="min-w-0 flex-1 space-y-3">
      <div className="sticky top-0 z-10 mb-1 flex flex-wrap items-center justify-end gap-2 rounded-md border bg-background/90 p-2 backdrop-blur-sm">
        <TaskFilterBar
          filters={filters}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
        />
      </div>

      <TreeSection
        title={`Tâches (${taskIds.length})`}
        expanded={expanded.tasks}
        onToggle={() => toggle("tasks")}
        accentColor="var(--entity-task)"
      >
        {taskTree.map(({ taskId, subtaskIds }) => (
          <TaskGroupRow key={taskId} taskId={taskId} subtaskIds={subtaskIds} />
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
        accentColor="var(--entity-question)"
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
        accentColor="var(--entity-deliverable)"
      >
        {deliverableIds.map((id) => (
          <DeliverableRow key={id} deliverableId={id} />
        ))}
        <AddItemRow
          value={newItems.deliverables}
          onChange={(v) => setNewItems((prev) => ({ ...prev, deliverables: v }))}
          onAdd={() => handleAdd("deliverables")}
          placeholder="Nouveau livrable..."
        />
      </TreeSection>
    </div>
  );
}
