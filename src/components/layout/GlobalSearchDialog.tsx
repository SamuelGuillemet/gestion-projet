import {
  FileText,
  HelpCircle,
  Package,
  Search,
  SquareCheckBig,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  buildGlobalSearchResults,
  type SearchEntityType,
  useGlobalSearchState,
} from "./global-search-state";

function typeLabel(type: SearchEntityType) {
  if (type === "notes") return "Note";
  if (type === "tasks") return "Tache";
  if (type === "questions") return "Question";
  return "Livrable";
}

function typeIcon(type: SearchEntityType) {
  if (type === "notes") return FileText;
  if (type === "tasks") return SquareCheckBig;
  if (type === "questions") return HelpCircle;
  return Package;
}

export function GlobalSearchDialog() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useGlobalSearchState((s) => s.open);
  const query = useGlobalSearchState((s) => s.query);
  const highlightedIndex = useGlobalSearchState((s) => s.highlightedIndex);
  const setOpen = useGlobalSearchState((s) => s.setOpen);
  const setQuery = useGlobalSearchState((s) => s.setQuery);
  const setHighlightedIndex = useGlobalSearchState(
    (s) => s.setHighlightedIndex,
  );
  const openResult = useGlobalSearchState((s) => s.openResult);

  const results = useMemo(() => buildGlobalSearchResults(query), [query]);

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
      openResult(item, navigate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full sm:max-w-3xl p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Recherche globale</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="top-1/2 left-2.5 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
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
            <div className="px-4 py-8 text-muted-foreground text-sm text-center">
              {query.trim()
                ? "Aucun resultat trouve"
                : "Commencez a taper pour rechercher dans tous les projets"}
            </div>
          ) : (
            <ul className="pb-3">
              {results.slice(0, 50).map((result, index) => {
                const Icon = typeIcon(result.type);
                const isActive = index === highlightedIndex;
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => openResult(result, navigate)}
                      className={cn(
                        "grid grid-cols-[auto_1fr_auto] items-start gap-3 px-4 py-3 w-full text-left transition-colors",
                        isActive ? "bg-muted" : "hover:bg-muted/60",
                      )}
                    >
                      <Icon className="mt-0.5 w-4 h-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {result.title}
                        </div>
                        <div className="mt-1 text-muted-foreground text-xs line-clamp-2">
                          {result.snippet || "Sans contenu"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline">
                          {typeLabel(result.type)}
                        </Badge>
                        <span className="inline-flex items-center gap-1.5 max-w-44 text-muted-foreground text-xs truncate">
                          <span
                            className="rounded-full w-2 h-2 shrink-0"
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
