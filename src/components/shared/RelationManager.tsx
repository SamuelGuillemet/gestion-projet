import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useEntityReferenceNavigation } from "@/hooks/useEntityReferenceNavigation";
import { useQuestions } from "@/hooks/useQuestions";
import { useRelations } from "@/hooks/useRelations";
import { useTasks } from "@/hooks/useTasks";
import {
  BACKLOG_ENTITY_REFERENCE_TYPES,
  type BacklogEntityReferenceType,
  getEntityReferenceLabel,
  getEntityReferenceTypeLabel,
  getEntityReferenceTypePluralLabel,
} from "@/lib/entity-references";
import { getInverseType, RELATION_STYLES } from "@/lib/relations";
import { cn } from "@/lib/utils";
import { RELATION_LABELS, type RelationType } from "@/models/relation";

type RelationItem = {
  id: string;
  label: string;
  number: number;
  type: BacklogEntityReferenceType | null;
};

interface RelationManagerProps {
  itemId: string;
  projectId: string;
}

export function RelationManager({ itemId, projectId }: RelationManagerProps) {
  const { relations, addRelation, deleteRelation } = useRelations();
  const tasks = useTasks();
  const questions = useQuestions();
  const deliverables = useDeliverables();
  const openReference = useEntityReferenceNavigation(projectId);

  const [adding, setAdding] = useState(false);
  const [relType, setRelType] = useState<RelationType>("relates");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | BacklogEntityReferenceType
  >("all");

  const itemRelations = relations.filter(
    (r) => r.sourceId === itemId || r.targetId === itemId,
  );
  const itemsByType = {
    tasks,
    questions,
    deliverables,
  };
  const allBacklogItems = BACKLOG_ENTITY_REFERENCE_TYPES.flatMap((type) =>
    itemsByType[type].map((item) => ({
      id: item.id,
      projectId: item.projectId,
      label: item.title,
      number: item.number,
      type,
    })),
  );

  const projectItems = allBacklogItems.filter(
    (item) => item.projectId === projectId && item.id !== itemId,
  );

  const filteredItems = projectItems.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (search.trim() && !i.label.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const itemById = new Map(allBacklogItems.map((item) => [item.id, item]));

  const getItemLabel = (id: string): RelationItem =>
    itemById.get(id) ?? { label: "Inconnu", number: 0, type: null, id };

  const openRelatedItem = (item: RelationItem) => {
    if (!item.type) return;

    openReference({
      type: item.type,
      number: item.number,
      label: getEntityReferenceLabel(item.type, item.number),
    });
  };

  const handleAdd = (targetId: string) => {
    addRelation(itemId, targetId, relType);
    setAdding(false);
    setSearch("");
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <Label className="text-muted-foreground text-xs">Relations</Label>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5"
          onClick={() => setAdding(!adding)}
        >
          {adding ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      {/* Existing relations */}
      {itemRelations.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {itemRelations.map((rel) => {
            const isSource = rel.sourceId === itemId;
            const otherId = isSource ? rel.targetId : rel.sourceId;
            const displayType = isSource ? rel.type : getInverseType(rel.type);
            const other = getItemLabel(otherId);
            const style = RELATION_STYLES[displayType];
            const Icon = style.icon;
            return (
              <div
                key={rel.id}
                className={cn(
                  "group flex items-center gap-2 hover:bg-accent/40 p-2 border rounded-md text-xs transition-colors",
                  style.bg,
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", style.color)} />
                <span className={cn("font-medium shrink-0", style.color)}>
                  {RELATION_LABELS[displayType]}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:underline"
                  onClick={() => openRelatedItem(other)}
                >
                  {other.label}
                </button>
                <div className="grow"></div>
                <span className="bg-white/80 px-1.5 py-0.5 border rounded text-[10px] text-muted-foreground">
                  {other.type
                    ? getEntityReferenceTypeLabel(other.type)
                    : "Inconnu"}
                </span>
                <ConfirmDialog
                  triggerClassName="inline-flex"
                  stopPropagation
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 transition-opacity shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  }
                  title="Supprimer la relation"
                  description="Cette action est irréversible. La relation sera définitivement supprimée."
                  onConfirm={() => deleteRelation(rel.id)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Add relation form */}
      {adding && (
        <div className="space-y-2 bg-card mt-2 p-2 border rounded-md">
          <div className="flex flex-wrap gap-1">
            {(Object.entries(RELATION_LABELS) as [RelationType, string][]).map(
              ([value, label]) => {
                const style = RELATION_STYLES[value];
                const Icon = style.icon;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRelType(value)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 border rounded font-medium text-[10px] transition-colors",
                      relType === value
                        ? [style.bg, style.color]
                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                );
              },
            )}
          </div>
          <div className="flex gap-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 h-7 text-xs"
              autoFocus
            />
            <select
              aria-label="Filtrer par type"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className="bg-background px-2 border border-input rounded-md h-7 text-xs"
            >
              <option value="all">Tous</option>
              {BACKLOG_ENTITY_REFERENCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getEntityReferenceTypePluralLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ajouter une relation avec ${item.label}`}
                onClick={() => handleAdd(item.id)}
                className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded w-full text-xs text-left transition-colors"
              >
                <span className="flex-1 truncate">{item.label}</span>
                <span className="bg-muted px-1 rounded text-[10px] text-muted-foreground shrink-0">
                  {getEntityReferenceTypeLabel(item.type)}
                </span>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <p className="py-2 text-[10px] text-muted-foreground text-center">
                Aucun élément trouvé.
              </p>
            )}
          </div>
        </div>
      )}

      {itemRelations.length === 0 && !adding && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          Aucune relation.
        </p>
      )}
    </div>
  );
}
