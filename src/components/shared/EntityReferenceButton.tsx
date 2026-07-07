import type { ComponentPropsWithoutRef } from "react";
import {
  useEntityReferenceNavigation,
  useResolvedEntityReference,
} from "@/hooks/useEntityReferenceNavigation";
import type { EntityReference } from "@/lib/entity-references";
import { cn } from "@/lib/utils";

type EntityReferenceButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onClick" | "type"
> & {
  reference?: EntityReference;
  referenceLabel?: string;
  projectId?: string | null;
};

export function EntityReferenceButton({
  className,
  reference,
  referenceLabel,
  projectId,
  ...props
}: EntityReferenceButtonProps) {
  const label = reference?.label ?? referenceLabel ?? "";
  const openReference = useEntityReferenceNavigation(projectId);
  const resolvedReference = useResolvedEntityReference(
    reference ?? label,
    projectId,
  );

  if (!resolvedReference) {
    return (
      <span
        {...props}
        className={cn(
          "inline-flex items-center gap-1.5 max-w-full text-muted-foreground",
          className,
        )}
      >
        {label}
      </span>
    );
  }

  const Icon = resolvedReference.icon;

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 hover:opacity-80 max-w-full text-primary underline underline-offset-2",
        className,
      )}
      data-entity-reference={resolvedReference.reference.label}
      title={resolvedReference.title}
      onClick={() => openReference(resolvedReference.reference)}
    >
      <Icon className="size-[1em] shrink-0" />
      <span>
        {resolvedReference.title}
        {" ("}
        <span className="font-data text-[0.9em] shrink-0">
          {resolvedReference.reference.label}
        </span>
        {")"}
      </span>
    </button>
  );
}
