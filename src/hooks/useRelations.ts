import { useShallow } from "zustand/react/shallow";
import { useRelationStore } from "@/store";

export function useRelations() {
  const relations = useRelationStore(useShallow((s) => s.relations));
  const addRelation = useRelationStore((s) => s.addRelation);
  const deleteRelation = useRelationStore((s) => s.deleteRelation);
  return { relations, addRelation, deleteRelation };
}
