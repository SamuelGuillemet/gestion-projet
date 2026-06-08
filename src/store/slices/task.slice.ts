import type { StateCreator } from "zustand";
import { BOARD_COLUMNS } from "@/constants/board-columns";
import { generateId } from "@/lib/utils";
import type { Task } from "@/models/task";

export interface TaskSlice {
  tasks: Task[];
  addTask: (projectId: string, title: string) => string;
  updateTask: (
    id: string,
    data: Partial<Omit<Task, "id" | "projectId">>,
  ) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, columnId: string, order: number) => void;
  reorderTasks: (columnId: string, orderedIds: string[]) => void;
}

export const createTaskSlice: StateCreator<TaskSlice, [], [], TaskSlice> = (
  set,
) => ({
  tasks: [],

  addTask: (projectId, title) => {
    const id = generateId();
    set((state) => {
      const columnTasks = state.tasks.filter(
        (t) => t.projectId === projectId && t.columnId === BOARD_COLUMNS[0].id,
      );
      return {
        tasks: [
          ...state.tasks,
          {
            id,
            projectId,
            title,
            description: "",
            columnId: BOARD_COLUMNS[0].id,
            order: columnTasks.length,
            tags: [],
            done: false,
          },
        ],
      };
    });
    return id;
  },

  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  moveTask: (id, columnId, order) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, columnId, order } : t,
      ),
    })),

  reorderTasks: (columnId, orderedIds) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.columnId !== columnId) return t;
        const newOrder = orderedIds.indexOf(t.id);
        return newOrder >= 0 ? { ...t, order: newOrder } : t;
      }),
    })),
});
