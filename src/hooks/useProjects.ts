import { useShallow } from "zustand/react/shallow";
import { useProjectStore } from "@/store";

export function useProjects() {
  const projects = useProjectStore(useShallow((s) => s.projects));
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
  };
}
