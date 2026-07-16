import {
  FileText,
  HelpCircle,
  type LucideIcon,
  Package,
  SquareCheckBig,
} from "lucide-react";

export type EntityReferenceType =
  | "tasks"
  | "questions"
  | "deliverables"
  | "notes";
export type BacklogEntityReferenceType = Exclude<EntityReferenceType, "notes">;
export type RelationEntityType = "task" | "question" | "deliverable";

export type EntityReferenceRecord = {
  id: string;
  projectId: string;
  number: number;
  title: string;
};

export type EntityReference = {
  type: EntityReferenceType;
  number: number;
  label: string;
};

type EntityReferenceDefinition = {
  prefix: string;
  label: string;
  pluralLabel: string;
  icon: LucideIcon;
  relationType?: RelationEntityType;
};

export const ENTITY_REFERENCE_TYPES: EntityReferenceType[] = [
  "tasks",
  "questions",
  "deliverables",
  "notes",
];

export const BACKLOG_ENTITY_REFERENCE_TYPES: BacklogEntityReferenceType[] = [
  "tasks",
  "questions",
  "deliverables",
];

export const ENTITY_REFERENCE_DEFINITIONS: Record<
  EntityReferenceType,
  EntityReferenceDefinition
> = {
  tasks: {
    prefix: "#",
    label: "Tâche",
    pluralLabel: "Tâches",
    icon: SquareCheckBig,
    relationType: "task",
  },
  questions: {
    prefix: "?",
    label: "Question",
    pluralLabel: "Questions",
    icon: HelpCircle,
    relationType: "question",
  },
  deliverables: {
    prefix: "!",
    label: "Livrable",
    pluralLabel: "Livrables",
    icon: Package,
    relationType: "deliverable",
  },
  notes: {
    prefix: "%",
    label: "Note",
    pluralLabel: "Notes",
    icon: FileText,
  },
};

function escapeRegExp(value: string) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, String.raw`\$&`);
}

const ENTITY_REFERENCE_PREFIX_PATTERN = ENTITY_REFERENCE_TYPES.map((type) =>
  escapeRegExp(ENTITY_REFERENCE_DEFINITIONS[type].prefix),
).join("");

const ENTITY_REFERENCE_EXACT_REGEX = new RegExp(
  String.raw`^([${ENTITY_REFERENCE_PREFIX_PATTERN}])(\d+)$`,
);

export const ENTITY_REFERENCE_REGEX = new RegExp(
  String.raw`([${ENTITY_REFERENCE_PREFIX_PATTERN}]\d+)`,
  "g",
);

export type EntityReferenceToken =
  | { type: "text"; value: string }
  | { type: "entity-reference"; value: string; reference: EntityReference };

export function getEntityReferenceTypeFromPrefix(prefix: string) {
  return (
    ENTITY_REFERENCE_TYPES.find(
      (type) => ENTITY_REFERENCE_DEFINITIONS[type].prefix === prefix,
    ) ?? null
  );
}

export function getEntityReferenceTypeLabel(type: EntityReferenceType) {
  return ENTITY_REFERENCE_DEFINITIONS[type].label;
}

export function getEntityReferenceTypePluralLabel(type: EntityReferenceType) {
  return ENTITY_REFERENCE_DEFINITIONS[type].pluralLabel;
}

export function getEntityReferenceIcon(type: EntityReferenceType) {
  return ENTITY_REFERENCE_DEFINITIONS[type].icon;
}

export function parseEntityReference(value: string): EntityReference | null {
  const match = ENTITY_REFERENCE_EXACT_REGEX.exec(value);
  if (!match) return null;

  const type = getEntityReferenceTypeFromPrefix(match[1]);
  const number = Number(match[2]);
  if (!type || !Number.isInteger(number)) return null;

  return { type, number, label: value };
}

export function getEntityReferenceLabel(
  type: EntityReferenceType,
  number: number,
) {
  return `${ENTITY_REFERENCE_DEFINITIONS[type].prefix}${number}`;
}

export function splitEntityReferenceText(
  value: string,
): EntityReferenceToken[] {
  const regex = new RegExp(ENTITY_REFERENCE_REGEX.source, "g");
  const tokens: EntityReferenceToken[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(regex)) {
    const index = match.index ?? 0;
    const label = match[0];

    if (index > lastIndex) {
      tokens.push({ type: "text", value: value.slice(lastIndex, index) });
    }

    const reference = parseEntityReference(label);
    tokens.push(
      reference
        ? { type: "entity-reference", value: label, reference }
        : { type: "text", value: label },
    );

    lastIndex = index + label.length;
  }

  if (lastIndex < value.length) {
    tokens.push({ type: "text", value: value.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: "text", value }];
}
