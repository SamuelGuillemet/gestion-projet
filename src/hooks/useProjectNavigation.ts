import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBacklogUI } from "@/components/backlog/backlog-state";
import { useProjectStore } from "@/store";

const PROJECT_TAB_SEGMENTS = new Set(["board", "backlog", "notes", "time"]);

export function getCurrentProjectTab(pathname: string) {
  const tab = pathname.split("/")[3];
  return tab && PROJECT_TAB_SEGMENTS.has(tab) ? tab : "board";
}

export function useProjectNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const setActiveProject = useProjectStore((state) => state.setActiveProject);
  const clearBacklogSelection = useBacklogUI((state) => state.clear);

  const switchProject = useCallback(
    (projectId: string, preserveCurrentTab = true) => {
      setActiveProject(projectId);
      clearBacklogSelection();
      const tab = preserveCurrentTab
        ? getCurrentProjectTab(location.pathname)
        : "board";
      navigate(`/project/${projectId}/${tab}`);
    },
    [clearBacklogSelection, location.pathname, navigate, setActiveProject],
  );

  const switchToDashboard = useCallback(() => {
    clearBacklogSelection();
    navigate("/dashboard/overview");
  }, [clearBacklogSelection, navigate]);

  return { switchProject, switchToDashboard };
}
