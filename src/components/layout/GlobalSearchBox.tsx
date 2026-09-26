import { Search } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGlobalSearchState } from "./global-search-state";

export function GlobalSearchBox() {
  const setOpen = useGlobalSearchState((s) => s.setOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 justify-start gap-2 border-foreground/15 bg-card/75 font-normal text-muted-foreground shadow-none hover:bg-accent/80 xl:w-92"
      onClick={() => {
        setOpen(true);
      }}
      title="Recherche globale (Ctrl+K)"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Rechercher partout...</span>
      <span className="font-data text-2xs opacity-70">Ctrl K</span>
    </Button>
  );
}
