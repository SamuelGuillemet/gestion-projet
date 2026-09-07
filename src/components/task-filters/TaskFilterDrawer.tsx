import { Filter, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { PRIORITY_OPTIONS, SIZE_OPTIONS } from "@/constants/task-options";
import type { Tag } from "@/models/tag";
import type { DueDateStatus, TaskCompletionStatus, TaskFilters } from "./task-filters";
import { countActiveFilters } from "./task-filters";

function toggleValue<T>(values: Set<T>, value: T) {
  return values.has(value)
    ? new Set([...values].filter((item) => item !== value))
    : new Set([...values, value]);
}

function FilterOption<T extends string>({
  checked,
  label,
  onCheckedChange,
  value,
  color,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (value: T) => void;
  value: T;
  color?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/60">
      <Checkbox checked={checked} onCheckedChange={() => onCheckedChange(value)} />
      {color && <span className="size-2 rounded-full" style={{ backgroundColor: color }}></span>}
      <span className="truncate text-sm" title={label}>
        {label}
      </span>
    </label>
  );
}

const DUE_DATE_OPTIONS: { value: DueDateStatus; label: string }[] = [
  { value: "overdue", label: "En retard" },
  { value: "today", label: "Aujourd'hui" },
  { value: "upcoming", label: "A venir" },
  { value: "none", label: "Sans echeance" },
];

const COMPLETION_OPTIONS: { value: TaskCompletionStatus; label: string }[] = [
  { value: "open", label: "Ouvertes" },
  { value: "completed", label: "Terminees" },
];

export function TaskFilterDrawer({
  filters,
  tags,
  updateFilters,
  clearFilters,
}: {
  filters: TaskFilters;
  tags: Tag[];
  updateFilters: (update: Partial<TaskFilters>) => void;
  clearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" size="sm" />}>
        <Filter className="size-4" />
        Filtres
        {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
      </DrawerTrigger>
      <DrawerContent className="w-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>Filtrer les taches</DrawerTitle>
            <DrawerClose
              render={<Button variant="ghost" size="icon" aria-label="Fermer les filtres" />}
            >
              <X className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <Input
            aria-label="Rechercher des taches"
            placeholder="Titre, description ou #reference"
            value={filters.query}
            onChange={(event) => updateFilters({ query: event.target.value })}
          />
          <FilterGroup title="Etiquettes">
            {tags.map((tag) => (
              <FilterOption
                key={tag.id}
                checked={filters.tagIds.has(tag.id)}
                label={tag.name}
                value={tag.id}
                color={tag.color}
                onCheckedChange={(value) =>
                  updateFilters({ tagIds: toggleValue(filters.tagIds, value) })
                }
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Priorite">
            {PRIORITY_OPTIONS.map((option) => (
              <FilterOption
                key={option.value}
                checked={filters.priorities.has(option.value)}
                label={option.label}
                value={option.value}
                onCheckedChange={(value) =>
                  updateFilters({
                    priorities: toggleValue(filters.priorities, value),
                  })
                }
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Taille">
            {SIZE_OPTIONS.map((option) => (
              <FilterOption
                key={option.value}
                checked={filters.sizes.has(option.value)}
                label={option.label}
                value={option.value}
                onCheckedChange={(value) =>
                  updateFilters({ sizes: toggleValue(filters.sizes, value) })
                }
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Echeance">
            {DUE_DATE_OPTIONS.map((option) => (
              <FilterOption
                key={option.value}
                checked={filters.dueDateStatuses.has(option.value)}
                label={option.label}
                value={option.value}
                onCheckedChange={(value) =>
                  updateFilters({
                    dueDateStatuses: toggleValue(filters.dueDateStatuses, value),
                  })
                }
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Etat">
            {COMPLETION_OPTIONS.map((option) => (
              <FilterOption
                key={option.value}
                checked={filters.completionStatuses.has(option.value)}
                label={option.label}
                value={option.value}
                onCheckedChange={(value) =>
                  updateFilters({
                    completionStatuses: toggleValue(filters.completionStatuses, value),
                  })
                }
              />
            ))}
          </FilterGroup>
        </div>
        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw className="size-4" />
            Effacer les filtres
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function TaskFilterBar({
  filters,
  tags,
  updateFilters,
  clearFilters,
}: {
  filters: TaskFilters;
  tags: Tag[];
  updateFilters: (update: Partial<TaskFilters>) => void;
  clearFilters: () => void;
}) {
  const activeFilterCount = countActiveFilters(filters);
  const summary = [
    filters.query.trim() && "Recherche",
    filters.tagIds.size > 0 && `${filters.tagIds.size} etiquette(s)`,
    filters.priorities.size > 0 && "Priorite",
    filters.sizes.size > 0 && "Taille",
    filters.dueDateStatuses.size > 0 && "Echeance",
    filters.completionStatuses.size > 0 && "Etat",
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilterCount > 0 && (
        <>
          <span className="max-w-80 truncate text-xs text-muted-foreground">
            {summary.join(" - ")}
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3.5" />
            Effacer
          </Button>
        </>
      )}
      <TaskFilterDrawer
        filters={filters}
        tags={tags}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
      />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-data mb-1 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-x-2">{children}</div>
    </section>
  );
}
