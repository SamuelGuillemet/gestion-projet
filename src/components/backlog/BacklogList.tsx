import { useState } from "react";
import {
  useDeliverableActions,
  useDeliverableIds,
} from "@/hooks/useDeliverables";
import { useQuestionActions, useQuestionIds } from "@/hooks/useQuestions";
import { useTaskActions, useTaskIds } from "@/hooks/useTasks";
import { type Section, useBacklogUI } from "./backlog-state";
import {
  AddItemRow,
  DeliverableRow,
  QuestionRow,
  TagFilter,
  TaskRow,
  TreeSection,
} from "./list";

interface BacklogListProps {
  activeProjectId: string;
}

export function BacklogList({ activeProjectId }: BacklogListProps) {
  const taskIds = useTaskIds(activeProjectId);
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

  const [filterTag, setFilterTag] = useState<string | null>(null);

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
    <div className="flex-1 space-y-3 min-w-0">
      <TagFilter selectedTag={filterTag} onSelectTag={setFilterTag} />

      <TreeSection
        title={`Tâches (${taskIds.length})`}
        expanded={expanded.tasks}
        onToggle={() => toggle("tasks")}
        accentColor="var(--entity-task)"
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
          onChange={(v) =>
            setNewItems((prev) => ({ ...prev, deliverables: v }))
          }
          onAdd={() => handleAdd("deliverables")}
          placeholder="Nouveau livrable..."
        />
      </TreeSection>
    </div>
  );
}
