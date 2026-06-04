import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Relation, RelationType } from "@/models/relation";

export interface RelationSlice {
  relations: Relation[];
  addRelation: (
    sourceId: string,
    targetId: string,
    type: RelationType,
  ) => string;
  deleteRelation: (id: string) => void;
}

export const createRelationSlice: StateCreator<
  RelationSlice,
  [],
  [],
  RelationSlice
> = (set) => ({
  relations: [],

  addRelation: (sourceId, targetId, type) => {
    const id = generateId();
    set((state) => ({
      relations: [...state.relations, { id, sourceId, targetId, type }],
    }));
    return id;
  },

  deleteRelation: (id) =>
    set((state) => ({
      relations: state.relations.filter((r) => r.id !== id),
    })),
});
