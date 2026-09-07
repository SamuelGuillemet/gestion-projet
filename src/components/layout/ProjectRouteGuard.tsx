import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useBacklogUI } from "@/components/backlog/backlog-state";
import { useProjectStore } from "@/store";

// IndexedDB rehydration is async, so `projects` starts empty on refresh; wait for it
// before deciding a project is missing, otherwise a valid project gets redirected away.
function useProjectsHydrated() {
  const [hydrated, setHydrated] = useState(() => useProjectStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    return useProjectStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  return hydrated;
}

// Keeps the global activeProjectId store in sync with the :projectId URL segment.
export function ProjectRouteGuard() {
  const { projectId } = useParams<{ projectId: string }>();
  const hydrated = useProjectsHydrated();
  const projectExists = useProjectStore((s) => s.projects.some((p) => p.id === projectId));
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const clearBacklogSelection = useBacklogUI((s) => s.clear);

  useEffect(() => {
    if (projectId && projectExists) {
      if (activeProjectId !== projectId) {
        clearBacklogSelection();
      }
      setActiveProject(projectId);
    }
  }, [activeProjectId, clearBacklogSelection, projectId, projectExists, setActiveProject]);

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!projectId || !projectExists) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <Outlet />;
}
