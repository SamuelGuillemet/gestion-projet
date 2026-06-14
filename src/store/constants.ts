export const STORE_VERSION = 3;

export const IDB_STORES_NAMES = [
  "gp-projects",
  "gp-tasks",
  "gp-tags",
  "gp-notes",
  "gp-questions",
  "gp-deliverables",
  "gp-time",
  "gp-relations",
] as const;

export type IdbStoresName = (typeof IDB_STORES_NAMES)[number];
