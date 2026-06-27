import type { LucideIcon } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { type Section, useBacklogUI } from "@/components/backlog/backlog-state";
import { useNotesUI } from "@/components/notes/notes-state";
import {
  type EntityReference,
  type EntityReferenceRecord,
  type EntityReferenceType,
  getEntityReferenceIcon,
  parseEntityReference,
} from "@/lib/entity-references";
import {
  useDeliverableStore,
  useNoteStore,
  useProjectStore,
  useQuestionStore,
  useTaskStore,
} from "@/store";

type Navigate = (to: string) => void;

export type EntityNavigationTarget =
  | { type: "notes"; id: string }
  | { type: Section; id: string };

type EntityReferenceAdapter = {
  getItems: () => EntityReferenceRecord[];
  open: (item: EntityReferenceRecord, navigate: Navigate) => void;
};

const ENTITY_REFERENCE_ADAPTERS: Record<
  EntityReferenceType,
  EntityReferenceAdapter
> = {
  notes: {
    getItems: () => useNoteStore.getState().notes,
    open: (note, navigate) => {
      useProjectStore.getState().setActiveProject(note.projectId);
      useNotesUI.getState().setActiveNoteId(note.projectId, note.id);
      navigate("/notes");
    },
  },
  tasks: {
    getItems: () => useTaskStore.getState().tasks,
    open: (task, navigate) => {
      useProjectStore.getState().setActiveProject(task.projectId);
      useBacklogUI.getState().select({ type: "tasks", id: task.id });
      navigate("/backlog");
    },
  },
  questions: {
    getItems: () => useQuestionStore.getState().questions,
    open: (question, navigate) => {
      useProjectStore.getState().setActiveProject(question.projectId);
      useBacklogUI.getState().select({ type: "questions", id: question.id });
      navigate("/backlog");
    },
  },
  deliverables: {
    getItems: () => useDeliverableStore.getState().deliverables,
    open: (deliverable, navigate) => {
      useProjectStore.getState().setActiveProject(deliverable.projectId);
      useBacklogUI
        .getState()
        .select({ type: "deliverables", id: deliverable.id });
      navigate("/backlog");
    },
  },
};

function findEntityById(type: EntityReferenceType, id: string) {
  return ENTITY_REFERENCE_ADAPTERS[type]
    .getItems()
    .find((item) => item.id === id);
}

export function findEntityByReference(
  reference: EntityReference,
  projectId: string,
) {
  return ENTITY_REFERENCE_ADAPTERS[reference.type]
    .getItems()
    .find(
      (item) =>
        item.projectId === projectId && item.number === reference.number,
    );
}

export function openEntityTarget(
  target: EntityNavigationTarget,
  navigate: Navigate,
) {
  const item = findEntityById(target.type, target.id);
  if (!item) return false;

  ENTITY_REFERENCE_ADAPTERS[target.type].open(item, navigate);
  return true;
}

export function useEntityNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (target: EntityNavigationTarget) => openEntityTarget(target, navigate),
    [navigate],
  );
}

function resolveEntityReference(
  reference: EntityReference,
  projectId: string,
): EntityNavigationTarget | null {
  const item = findEntityByReference(reference, projectId);
  return item ? { type: reference.type, id: item.id } : null;
}

export function useEntityReferenceNavigation(projectId?: string | null) {
  const openEntity = useEntityNavigation();

  return useCallback(
    (reference: EntityReference) => {
      const targetProjectId =
        projectId ?? useProjectStore.getState().activeProjectId;
      if (!targetProjectId) return false;

      const target = resolveEntityReference(reference, targetProjectId);
      return target ? openEntity(target) : false;
    },
    [openEntity, projectId],
  );
}

type ResolvedEntityReference = {
  icon: LucideIcon;
  reference: EntityReference;
  title: string;
};

export function useResolvedEntityReference(
  value: string | EntityReference,
): ResolvedEntityReference | null {
  const reference =
    typeof value === "string" ? parseEntityReference(value) : value;
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const tasks = useTaskStore((state) => state.tasks);
  const questions = useQuestionStore((state) => state.questions);
  const deliverables = useDeliverableStore((state) => state.deliverables);
  const notes = useNoteStore((state) => state.notes);

  if (!reference || !activeProjectId) return null;

  const itemsByType: Record<EntityReferenceType, EntityReferenceRecord[]> = {
    tasks,
    questions,
    deliverables,
    notes,
  };
  const target = itemsByType[reference.type].find(
    (item) =>
      item.projectId === activeProjectId && item.number === reference.number,
  );
  if (!target) return null;

  return {
    icon: getEntityReferenceIcon(reference.type),
    reference,
    title: target.title || "Sans titre",
  };
}
