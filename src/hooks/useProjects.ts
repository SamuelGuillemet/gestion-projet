import { useShallow } from "zustand/react/shallow";
import { useProjectStore } from "@/store";
import { deleteProjectCascade } from "@/store/cascade-delete";
import { createSnapshot } from "@/store/snapshots";

export function useProjects() {
  const projects = useProjectStore(useShallow((s) => s.projects));
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = (id: string) => {
    void createSnapshot({ label: `pre-project-delete:${id}` });
    deleteProjectCascade(id);
  };

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
