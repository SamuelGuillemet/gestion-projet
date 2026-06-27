import {
  type EntityReference,
  getEntityReferenceTypeLabel,
} from "@/lib/entity-references";
import { RELATION_STYLES } from "@/lib/relations";
import { cn } from "@/lib/utils";
import { RELATION_LABELS, type RelationType } from "@/models/relation";

interface RelationBadgeProps {
  type: RelationType;
  reference: EntityReference;
  title?: string;
}

export function RelationBadge({ type, reference, title }: RelationBadgeProps) {
  const style = RELATION_STYLES[type];
  const Icon = style.icon;
  const referenceTypeLabel = getEntityReferenceTypeLabel(reference.type);
  const titleSuffix = title ? ` - ${title}` : "";
  const tooltip = `${RELATION_LABELS[type]} ${referenceTypeLabel} ${reference.label}${titleSuffix}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 border rounded font-medium text-[10px]",
        style.className,
      )}
      title={tooltip}
    >
      <Icon className="size-3" />
      <span className="font-data">{reference.label}</span>
    </span>
  );
}
