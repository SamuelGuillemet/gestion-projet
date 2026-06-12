import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Project } from "@/models/project";

export interface ProjectSlice {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  addProject: (name: string, color: string) => string;
  updateProject: (
    id: string,
    data: Partial<Pick<Project, "name" | "color">>,
  ) => void;
  deleteProject: (id: string) => void;
}

export const createProjectSlice: StateCreator<
  ProjectSlice,
  [],
  [],
  ProjectSlice
> = (set) => ({
  projects: [],
  activeProjectId: null,

  setActiveProject: (id) => set({ activeProjectId: id }),

  addProject: (name, color) => {
    const id = generateId();
    set((state) => ({
      projects: [
        ...state.projects,
        {
          id,
          name,
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
    return id;
  },

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p,
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId:
        state.activeProjectId === id ? null : state.activeProjectId,
    })),
});
