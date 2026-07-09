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
      className="justify-start gap-2 bg-card/75 hover:bg-accent/80 shadow-none border-foreground/15 xl:w-64 h-9 font-normal text-muted-foreground"
      onClick={() => {
        setOpen(true);
      }}
      title="Recherche globale (Ctrl+K)"
    >
      <Search className="w-4 h-4" />
      <span className="flex-1 text-left">Rechercher partout...</span>
      <span className="opacity-70 font-data text-[10px]">Ctrl K</span>
    </Button>
  );
}
