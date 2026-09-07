import { Search } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEntityNavigation } from "@/hooks/useEntityReferenceNavigation";
import { getEntityReferenceIcon, getEntityReferenceTypeLabel } from "@/lib/entity-references";
import { cn } from "@/lib/utils";
import {
  buildGlobalSearchResults,
  type GlobalSearchResult,
  useGlobalSearchState,
} from "./global-search-state";

export function GlobalSearchDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const openEntity = useEntityNavigation();

  const open = useGlobalSearchState((s) => s.open);
  const query = useGlobalSearchState((s) => s.query);
  const highlightedIndex = useGlobalSearchState((s) => s.highlightedIndex);
  const setOpen = useGlobalSearchState((s) => s.setOpen);
  const setQuery = useGlobalSearchState((s) => s.setQuery);
  const setHighlightedIndex = useGlobalSearchState((s) => s.setHighlightedIndex);

  const results = buildGlobalSearchResults(query);

  const openResult = (result: GlobalSearchResult) => {
    if (openEntity({ type: result.type, id: result.id })) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    setHighlightedIndex(0);
  }, [open, setHighlightedIndex]);

  const onSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex(Math.min(results.length - 1, highlightedIndex + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(Math.max(0, highlightedIndex - 1));
      return;
    }

    if (event.key === "Enter") {
      const item = results[highlightedIndex];
      if (!item) return;
      event.preventDefault();
      openResult(item);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full p-0 sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Recherche globale</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchInputKeyDown}
              placeholder="Chercher dans les notes, taches, questions, livrables..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {query.trim()
                ? "Aucun resultat trouve"
                : "Commencez a taper pour rechercher dans tous les projets"}
            </div>
          ) : (
            <ul className="pb-3">
              {results.slice(0, 50).map((result, index) => {
                const Icon = getEntityReferenceIcon(result.type);
                const isActive = index === highlightedIndex;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => openResult(result)}
                      className={cn(
                        "grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3 text-left transition-colors",
                        isActive ? "bg-muted" : "hover:bg-muted/60",
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{result.title}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {result.snippet || "Sans contenu"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">{getEntityReferenceTypeLabel(result.type)}</Badge>
                        <span className="inline-flex max-w-44 items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: result.projectColor }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{result.projectName}</span>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
