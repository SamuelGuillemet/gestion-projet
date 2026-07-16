import { useShallow } from "zustand/react/shallow";
import {
  BACKLOG_ENTITY_REFERENCE_TYPES,
  type BacklogEntityReferenceType,
  type EntityReference,
  type EntityReferenceRecord,
  getEntityReferenceLabel,
} from "@/lib/entity-references";
import { getInverseType } from "@/lib/relations";
import type { RelationType } from "@/models/relation";
import {
  useDeliverableStore,
  useQuestionStore,
  useRelationStore,
  useTaskStore,
} from "@/store";

export type RelatedEntityRelation = {
  id: string;
  type: RelationType;
  reference: EntityReference;
  title: string;
};

type RelationLookupItem = EntityReferenceRecord & {
  type: BacklogEntityReferenceType;
};

export function useRelationOfTask(taskId: string) {
  const relations = useRelationStore(useShallow((s) => s.relations));
  const tasks = useTaskStore(useShallow((s) => s.tasks));
  const questions = useQuestionStore(useShallow((s) => s.questions));
  const deliverables = useDeliverableStore(useShallow((s) => s.deliverables));

  const itemsByType = {
    tasks,
    questions,
    deliverables,
  };

  const itemById = new Map<string, RelationLookupItem>();

  for (const type of BACKLOG_ENTITY_REFERENCE_TYPES) {
    for (const item of itemsByType[type]) {
      itemById.set(item.id, { ...item, type });
    }
  }

  const relationStatuses: RelatedEntityRelation[] = [];

  for (const relation of relations) {
    if (relation.sourceId !== taskId && relation.targetId !== taskId) {
      continue;
    }

    const displayType =
      relation.sourceId === taskId
        ? relation.type
        : getInverseType(relation.type);
    const relatedId =
      relation.sourceId === taskId ? relation.targetId : relation.sourceId;
    const relatedItem = itemById.get(relatedId);
    if (!relatedItem) {
      continue;
    }

    relationStatuses.push({
      id: relation.id,
      type: displayType,
      reference: {
        type: relatedItem.type,
        number: relatedItem.number,
        label: getEntityReferenceLabel(relatedItem.type, relatedItem.number),
      },
      title: relatedItem.title || "Sans titre",
    });
  }

  return relationStatuses;
}

export function useRelations() {
  const relations = useRelationStore(useShallow((s) => s.relations));
  const addRelation = useRelationStore((s) => s.addRelation);
  const deleteRelation = useRelationStore((s) => s.deleteRelation);
  return { relations, addRelation, deleteRelation };
}
