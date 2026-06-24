import { Clock, FileText, KanbanSquare, List } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ActivityReport } from "@/components/time/report/ActivityReport";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataActions } from "./DataActions";
import { GlobalSearchBox } from "./GlobalSearchBox";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { ProjectSelector } from "./ProjectSelector";
import { TagManager } from "./TagManager";

const TABS = [
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

  return (
    <div className="flex flex-col bg-background h-screen">
      <Tabs
        value={currentTab}
        onValueChange={(v) => navigate(v)}
        className="flex flex-col flex-1"
      >
        <header className="top-0 z-10 sticky flex justify-between items-center bg-card/80 backdrop-blur-sm px-6 lg:px-10 py-2 border-border/60 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-4">
              <div className="flex justify-center items-center bg-primary rounded-lg w-7 h-7">
                <KanbanSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="font-bold text-lg tracking-tight">
                Gestion de Projet
              </h1>
            </div>
            <TabsList className="w-fit">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} className="gap-1.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearchBox />
            <ActivityReport />
            <TagManager />
            <DataActions />
            <ProjectSelector />
          </div>
        </header>

        <main className="flex-1 p-5 overflow-hidden">
          <Outlet />
        </main>
      </Tabs>
      <GlobalSearchDialog />
    </div>
  );
}
