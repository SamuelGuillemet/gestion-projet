import type { StateCreator } from "zustand";
import {
  BOARD_COLUMNS,
  type BoardColumnId,
  DONE_COLUMN_ID,
} from "@/constants/board-columns";
import { generateId } from "@/lib/utils";
import type { Task } from "@/models/task";
import { getNextProjectScopedNumber } from "./utils";

export interface TaskSlice {
  tasks: Task[];
  addTask: (projectId: string, title: string) => string;
  updateTask: (
    id: string,
    data: Partial<Omit<Task, "id" | "projectId">>,
  ) => void;
  deleteTask: (id: string) => void;
  dndTasks: (newState: Record<BoardColumnId, string[]>) => void;
}

export const createTaskSlice: StateCreator<TaskSlice, [], [], TaskSlice> = (
  set,
) => ({
  tasks: [],

  addTask: (projectId, title) => {
    const id = generateId();
    set((state) => {
      const now = new Date().toISOString();
      const columnTasks = state.tasks.filter(
        (t) => t.projectId === projectId && t.columnId === BOARD_COLUMNS[0].id,
      );
      return {
        tasks: [
          ...state.tasks,
          {
            id,
            projectId,
            number: getNextProjectScopedNumber(state.tasks, projectId),
            title,
            description: "",
            columnId: BOARD_COLUMNS[0].id,
            order: columnTasks.length,
            tags: [],
            done: false,
            checks: [],
            createdAt: now,
            updatedAt: now,
          },
        ],
      };
    });
    return id;
  },

  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t,
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  dndTasks: (newState) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        const columnId = Object.keys(newState).find((colId) =>
          newState[colId].includes(t.id),
        );
        if (!columnId) return t;
        const newOrder = newState[columnId].indexOf(t.id);
        const changed = columnId !== t.columnId || newOrder !== t.order;
        return {
          ...t,
          columnId,
          order: newOrder,
          done: columnId === DONE_COLUMN_ID,
          updatedAt: changed ? new Date().toISOString() : t.updatedAt,
        };
      }),
    })),
});
