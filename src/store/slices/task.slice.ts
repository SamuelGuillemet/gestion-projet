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
  addSubtask: (parentTaskId: string, title: string) => string | null;
  updateTask: (
    id: string,
    data: Partial<Omit<Task, "id" | "projectId" | "parentTaskId">>,
  ) => void;
  deleteTask: (id: string) => void;
  dndTasks: (newState: Record<BoardColumnId, string[]>) => void;
  moveTasksToProject: (taskIds: string[], targetProjectId: string) => string[];
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

  addSubtask: (parentTaskId, title) => {
    const id = generateId();
    set((state) => {
      const parent = state.tasks.find((task) => task.id === parentTaskId);
      if (!parent || parent.parentTaskId) return state;

      const now = new Date().toISOString();
      return {
        tasks: [
          ...state.tasks,
          {
            id,
            projectId: parent.projectId,
            number: getNextProjectScopedNumber(state.tasks, parent.projectId),
            parentTaskId,
            title,
            description: "",
            columnId: BOARD_COLUMNS[0].id,
            order: state.tasks.filter(
              (task) =>
                task.projectId === parent.projectId &&
                task.columnId === BOARD_COLUMNS[0].id,
            ).length,
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

  moveTasksToProject: (taskIds, targetProjectId) => {
    let movedIds: string[] = [];
    set((state) => {
      const idsToMove = new Set(taskIds);
      // moving a parent task brings its subtasks along
      for (const task of state.tasks) {
        if (task.parentTaskId && idsToMove.has(task.parentTaskId)) {
          idsToMove.add(task.id);
        }
      }
      if (idsToMove.size === 0) return state;
      movedIds = Array.from(idsToMove);

      const now = new Date().toISOString();
      const columnOrderCounts: Record<string, number> = {};
      for (const task of state.tasks) {
        if (task.projectId === targetProjectId && !idsToMove.has(task.id)) {
          columnOrderCounts[task.columnId] =
            (columnOrderCounts[task.columnId] ?? 0) + 1;
        }
      }
      let nextNumber = getNextProjectScopedNumber(state.tasks, targetProjectId);

      return {
        tasks: state.tasks.map((task) => {
          if (!idsToMove.has(task.id)) return task;
          const keepsParent =
            !!task.parentTaskId && idsToMove.has(task.parentTaskId);
          const order = columnOrderCounts[task.columnId] ?? 0;
          columnOrderCounts[task.columnId] = order + 1;
          return {
            ...task,
            projectId: targetProjectId,
            parentTaskId: keepsParent ? task.parentTaskId : undefined,
            number: nextNumber++,
            order,
            updatedAt: now,
          };
        }),
      };
    });
    return movedIds;
  },
});
