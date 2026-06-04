export type RelationType = "blocks" | "blocked-by" | "relates" | "duplicates";

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
}

export const RELATION_LABELS: Record<RelationType, string> = {
  blocks: "Bloque",
  "blocked-by": "Bloqué par",
  relates: "Lié à",
  duplicates: "Duplique",
};
