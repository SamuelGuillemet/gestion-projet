export type EntityReferenceType =
  | "tasks"
  | "questions"
  | "deliverables"
  | "notes";

export type EntityReference = {
  type: EntityReferenceType;
  number: number;
  label: string;
};

export const ENTITY_REFERENCE_REGEX = /([#?!%]\d+)/g;

const TYPE_BY_PREFIX: Record<string, EntityReferenceType> = {
  "#": "tasks",
  "?": "questions",
  "!": "deliverables",
  "%": "notes",
};

export function parseEntityReference(value: string): EntityReference | null {
  const match = /^([#?!%])(\d+)$/.exec(value);
  if (!match) return null;

  const type = TYPE_BY_PREFIX[match[1]];
  const number = Number(match[2]);
  if (!type || !Number.isInteger(number)) return null;

  return { type, number, label: value };
}

export function getEntityReferenceLabel(
  type: EntityReferenceType,
  number: number,
) {
  if (type === "tasks") return `#${number}`;
  if (type === "questions") return `?${number}`;
  if (type === "deliverables") return `!${number}`;
  return `%${number}`;
}
