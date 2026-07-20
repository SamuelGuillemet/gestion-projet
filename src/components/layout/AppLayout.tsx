import { Clock, FileText, KanbanSquare, List, Target } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ActivityReport } from "@/components/time/report/ActivityReport";
import { cn } from "@/lib/utils";
import { DataActions } from "./DataActions";
import { GlobalSearchBox } from "./GlobalSearchBox";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { ProjectSelector } from "./ProjectSelector";
import { TagManager } from "./TagManager";
import { useEffect } from "react";
import { flushPendingIdbStorageWrites, hasPendingIdbStorageWrites } from "@/store/idb-storage";

const ROUTE_PREFETCHERS: Record<string, () => Promise<unknown>> = {
  "/focus": () => import("@/components/focus/FocusPage"),
  "/board": () => import("@/components/board/BoardPage"),
  "/backlog": () => import("@/components/backlog/BacklogPage"),
  "/notes": () => import("@/components/notes/NotesPage"),
  "/time": () => import("@/components/time/TimePage"),
};

const prefetchRoute = (path: string) => {
  const importer = ROUTE_PREFETCHERS[path];
  if (!importer) return;
  void importer();
};

const TABS = [
  { value: "/focus", label: "Focus", icon: Target },
  { value: "/board", label: "Board", icon: KanbanSquare },
  { value: "/backlog", label: "Backlog", icon: List },
  { value: "/notes", label: "Notes", icon: FileText },
  { value: "/time", label: "Temps", icon: Clock },
] as const;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab =
    TABS.find((t) => location.pathname.startsWith(t.value))?.value ?? "/board";

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!hasPendingIdbStorageWrites()) {
        return;
      }
      e.preventDefault();
      await flushPendingIdbStorageWrites();
    }

    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      flushPendingIdbStorageWrites();
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex md:flex-row flex-col bg-background h-screen overflow-hidden text-foreground atelier-shell">
      <div className="flex flex-col flex-1 min-w-0">
        <header className="z-10 flex lg:flex-row flex-col lg:items-center gap-2 bg-card px-4 py-1.5 border-border/70 border-b h-12 shrink-0">
          <section className="flex flex-1 items-center gap-3 min-w-0">
            <ProjectSelector />
            <nav className="flex gap-1 px-2 md:px-3 pb-2 md:pb-0 md:overflow-visible overflow-x-auto">
              {TABS.map(({ value, label, icon: Icon }) => {
                const active = currentTab === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    data-active={active}
                    onMouseEnter={() => prefetchRoute(value)}
                    onFocus={() => prefetchRoute(value)}
                    onClick={() => navigate(value)}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-2 border rounded-md min-w-28 md:min-w-0 text-sm text-left transition-all",
                      active
                        ? "border-primary/30 bg-card text-foreground shadow-sm"
                        : "border-transparent text-muted-foreground hover:hover:bg-card/65 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </nav>
          </section>

          <div className="flex flex-wrap lg:justify-end items-center gap-2 min-w-0">
            <GlobalSearchBox />
            <div className="flex items-center gap-1 bg-muted/55 p-0.5 rounded-md">
              <ActivityReport />
              <TagManager />
              <DataActions />
            </div>
          </div>
        </header>

        <main className="flex-1 p-2 lg:p-4 min-h-0 overflow-hidden">
          <div className="h-full min-h-0 atelier-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalSearchDialog />
    </div>
  );
}
