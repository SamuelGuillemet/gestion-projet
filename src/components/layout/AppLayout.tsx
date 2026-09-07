import { BarChart3, Clock, FileText, KanbanSquare, List, Settings, Target } from "lucide-react";
import { useEffect } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { flushPendingIdbStorageWrites, hasPendingIdbStorageWrites } from "@/store/idb-storage";
import { createAutoSnapshotIfNeeded } from "@/store/snapshots";
import { AppSwitcher } from "./AppSwitcher";
import { GlobalSearchBox } from "./GlobalSearchBox";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { HelpDialog } from "./HelpDialog";
import { ProjectSelector } from "./ProjectSelector";
import { ThemeToggle } from "./ThemeToggle";

const DASHBOARD_ROUTE_PREFETCHERS: Record<string, () => Promise<unknown>> = {
  "/dashboard/overview": () => import("@/components/focus/OverviewPage"),
  "/dashboard/rapport": () => import("@/components/time/report/ActivityReport"),
  "/dashboard/gestion": () => import("@/components/settings/SettingsPage"),
};

const PROJECT_ROUTE_PREFETCHERS: Record<string, () => Promise<unknown>> = {
  board: () => import("@/components/board/BoardPage"),
  backlog: () => import("@/components/backlog/BacklogPage"),
  notes: () => import("@/components/notes/NotesPage"),
  time: () => import("@/components/time/TimePage"),
};

const DASHBOARD_TABS = [
  { value: "/dashboard/overview", label: "Overview", icon: Target },
  { value: "/dashboard/rapport", label: "Rapport", icon: BarChart3 },
  { value: "/dashboard/gestion", label: "Gestion", icon: Settings },
] as const;

const PROJECT_TABS = [
  { value: "board", label: "Board", icon: KanbanSquare },
  { value: "backlog", label: "Backlog", icon: List },
  { value: "notes", label: "Notes", icon: FileText },
  { value: "time", label: "Temps", icon: Clock },
] as const;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const projectMatch = matchPath("/project/:projectId/*", location.pathname);
  const projectId = projectMatch?.params.projectId ?? null;

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!hasPendingIdbStorageWrites()) {
        return;
      }
      e.preventDefault();
      await flushPendingIdbStorageWrites();
    };

    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      flushPendingIdbStorageWrites();
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Keep auto-backup running regardless of which page/route is currently mounted.
  useEffect(() => {
    const runAutoBackup = async () => {
      try {
        await createAutoSnapshotIfNeeded();
      } catch (e) {
        console.error("[auto-backup] Failed", e);
      }
    };

    runAutoBackup();

    const intervalId = globalThis.setInterval(
      () => {
        runAutoBackup();
      },
      60 * 60 * 1000,
    );

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const tabs = projectId
    ? PROJECT_TABS.map((tab) => {
        const to = `/project/${projectId}/${tab.value}`;
        const active = location.pathname.startsWith(to);
        const prefetcher = PROJECT_ROUTE_PREFETCHERS[tab.value];
        return { ...tab, to, active, prefetcher };
      })
    : DASHBOARD_TABS.map((tab) => {
        const active = location.pathname.startsWith(tab.value);
        const prefetcher = DASHBOARD_ROUTE_PREFETCHERS[tab.value];
        return { ...tab, to: tab.value, active, prefetcher };
      });

  return (
    <div className="atelier-shell flex h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-10 grid h-12 shrink-0 grid-cols-[18rem_1fr_minmax(12rem,0.5fr)_auto] items-center gap-2 border-b border-border/70 bg-card px-4 py-1">
          <ProjectSelector />
          <nav className="flex gap-1 overflow-x-auto pb-2 md:overflow-visible md:pb-0">
            {tabs.map(({ value, label, icon: Icon, to, active, prefetcher }) => (
              <button
                key={value}
                type="button"
                aria-current={active ? "page" : undefined}
                data-active={active}
                onMouseEnter={() => void prefetcher?.()}
                onFocus={() => void prefetcher?.()}
                onClick={() => navigate(to)}
                className={cn(
                  "group flex min-w-28 items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-all md:min-w-0",
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
            ))}
          </nav>

          <div className="flex min-w-0 justify-center">
            <GlobalSearchBox />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-md bg-muted/55 p-0.5">
              <ThemeToggle />
              <HelpDialog />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden p-2 lg:p-4">
          <div className="atelier-page-enter h-full min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalSearchDialog />
      <AppSwitcher />
    </div>
  );
}
