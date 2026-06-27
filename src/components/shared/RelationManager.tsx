import {
  ArrowRightLeft,
  Ban,
  Copy,
  type Link2,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useQuestions } from "@/hooks/useQuestions";
import { useRelations } from "@/hooks/useRelations";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { RELATION_LABELS, type RelationType } from "@/models/relation";

const RELATION_STYLES: Record<
  RelationType,
  { color: string; bg: string; icon: typeof Link2 }
> = {
  blocks: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Ban },
  "blocked-by": {
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: ShieldAlert,
  },
  relates: {
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: ArrowRightLeft,
  },
  duplicates: {
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: Copy,
  },
};

const TYPE_LABELS: Record<string, string> = {
  task: "Tâche",
  question: "Question",
  deliverable: "Livrable",
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

  const [adding, setAdding] = useState(false);
  const [relType, setRelType] = useState<RelationType>("relates");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "task" | "question" | "deliverable"
  >("all");

  const itemRelations = useMemo(
    () =>
      relations.filter((r) => r.sourceId === itemId || r.targetId === itemId),
    [relations, itemId],
  );

  const projectItems = useMemo(() => {
    const taskItems = tasks
      .filter((t) => t.projectId === projectId && t.id !== itemId)
      .map((t) => ({ id: t.id, label: t.title, type: "task" as const }));
    const questionItems = questions
      .filter((q) => q.projectId === projectId && q.id !== itemId)
      .map((q) => ({ id: q.id, label: q.title, type: "question" as const }));
    const deliverableItems = deliverables
      .filter((d) => d.projectId === projectId && d.id !== itemId)
      .map((d) => ({ id: d.id, label: d.title, type: "deliverable" as const }));
    return [...taskItems, ...questionItems, ...deliverableItems];
  }, [tasks, questions, deliverables, projectId, itemId]);

  const filteredItems = useMemo(() => {
    let items = projectItems;
    if (typeFilter !== "all") {
      items = items.filter((i) => i.type === typeFilter);
    }
    if (search.trim()) {
      const lower = search.toLowerCase();
      items = items.filter((i) => i.label.toLowerCase().includes(lower));
    }
    return items;
  }, [projectItems, search, typeFilter]);

  const getItemLabel = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) return { label: task.title, type: "task" };
    const question = questions.find((q) => q.id === id);
    if (question) return { label: question.title, type: "question" };
    const deliverable = deliverables.find((d) => d.id === id);
    if (deliverable) return { label: deliverable.title, type: "deliverable" };
    return { label: "Inconnu", type: "unknown" };
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
                  "flex items-center gap-2 text-xs p-2 rounded-md border group",
                  style.bg,
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", style.color)} />
                <span className={cn("font-medium shrink-0", style.color)}>
                  {RELATION_LABELS[displayType]}
                </span>
                <span className="flex-1 font-medium text-foreground truncate">
                  {other.label}
                </span>
                <span className="bg-white/80 px-1.5 py-0.5 border rounded text-[10px] text-muted-foreground">
                  {TYPE_LABELS[other.type] || "Inconnu"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 transition-opacity shrink-0"
                  onClick={() => deleteRelation(rel.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
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
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors border",
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
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className="bg-background px-2 border border-input rounded-md h-7 text-xs"
            >
              <option value="all">Tous</option>
              <option value="task">Tâches</option>
              <option value="question">Questions</option>
              <option value="deliverable">Livrables</option>
            </select>
          </div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAdd(item.id)}
                className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded w-full text-xs text-left transition-colors"
              >
                <span className="flex-1 truncate">{item.label}</span>
                <span className="bg-muted px-1 rounded text-[10px] text-muted-foreground shrink-0">
                  {TYPE_LABELS[item.type] || "Inconnu"}
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

function getInverseType(type: RelationType): RelationType {
  switch (type) {
    case "blocks":
      return "blocked-by";
    case "blocked-by":
      return "blocks";
    default:
      return type;
  }
}
