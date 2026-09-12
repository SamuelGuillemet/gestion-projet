import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { useTasks } from "@/hooks/useTasks";
import { toIsoDateInput } from "@/lib/time";
import type { Task, TaskPriority, TaskSize } from "@/models/task";

const FILTER_SCHEMA_VERSION = 1;

export type DueDateStatus = "overdue" | "today" | "upcoming" | "none" | "done";
export type TaskCompletionStatus = "open" | "completed";

export interface TaskFilters {
  query: string;
  tagIds: Set<string>;
  priorities: Set<TaskPriority>;
  sizes: Set<TaskSize>;
  dueDateStatuses: Set<DueDateStatus>;
  completionStatuses: Set<TaskCompletionStatus>;
}

interface PersistedTaskFilters {
  version: typeof FILTER_SCHEMA_VERSION;
  query: string;
  tagIds: string[];
  priorities: TaskPriority[];
  sizes: TaskSize[];
  dueDateStatuses: DueDateStatus[];
  completionStatuses: TaskCompletionStatus[];
}

const DEFAULT_FILTERS: TaskFilters = {
  query: "",
  tagIds: new Set(),
  priorities: new Set(),
  sizes: new Set(),
  dueDateStatuses: new Set(),
  completionStatuses: new Set(),
};

function storageKey(projectId: string, page: "kanban" | "backlog") {
  return `task-filters:${projectId}:${page}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseFilters(value: string | null): TaskFilters {
  if (!value) return DEFAULT_FILTERS;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_FILTERS;
    const data = parsed as Record<string, unknown>;
    if (data.version !== FILTER_SCHEMA_VERSION) return DEFAULT_FILTERS;

    return {
      query: typeof data.query === "string" ? data.query : "",
      tagIds: new Set(isStringArray(data.tagIds) ? data.tagIds : []),
      priorities: new Set(
        isStringArray(data.priorities)
          ? data.priorities.filter(
              (value): value is TaskPriority =>
                value === "low" || value === "medium" || value === "high",
            )
          : [],
      ),
      sizes: new Set(
        isStringArray(data.sizes)
          ? data.sizes.filter(
              (value): value is TaskSize =>
                value === "small" || value === "medium" || value === "large",
            )
          : [],
      ),
      dueDateStatuses: new Set(
        isStringArray(data.dueDateStatuses)
          ? data.dueDateStatuses.filter(
              (value): value is DueDateStatus =>
                value === "overdue" ||
                value === "today" ||
                value === "upcoming" ||
                value === "none",
            )
          : [],
      ),
      completionStatuses: new Set(
        isStringArray(data.completionStatuses)
          ? data.completionStatuses.filter(
              (value): value is TaskCompletionStatus => value === "open" || value === "completed",
            )
          : [],
      ),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function loadFilters(projectId: string, page: "kanban" | "backlog") {
  try {
    return parseFilters(localStorage.getItem(storageKey(projectId, page)));
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(projectId: string, page: "kanban" | "backlog", filters: TaskFilters) {
  try {
    const persistedFilters: PersistedTaskFilters = {
      version: FILTER_SCHEMA_VERSION,
      query: filters.query,
      tagIds: [...filters.tagIds],
      priorities: [...filters.priorities],
      sizes: [...filters.sizes],
      dueDateStatuses: [...filters.dueDateStatuses],
      completionStatuses: [...filters.completionStatuses],
    };
    localStorage.setItem(storageKey(projectId, page), JSON.stringify(persistedFilters));
  } catch {
    // Filters remain usable when local storage is unavailable.
  }
}

export function countActiveFilters(filters: TaskFilters) {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.tagIds.size +
    filters.priorities.size +
    filters.sizes.size +
    filters.dueDateStatuses.size +
    filters.completionStatuses.size
  );
}

function dueDateStatus(task: Task, today: string): DueDateStatus {
  if (task.done) return "done";
  if (!task.dueDate) return "none";
  if (task.dueDate < today) return "overdue";
  if (task.dueDate === today) return "today";
  return "upcoming";
}

export function filterTasks(tasks: Task[], filters: TaskFilters, today: string) {
  const query = filters.query.trim().toLocaleLowerCase();

  return tasks.filter((task) => {
    if (
      query &&
      !`${task.title} ${task.description} #${task.number}`.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.tagIds.size > 0 && !task.tags.some((tagId) => filters.tagIds.has(tagId))) {
      return false;
    }
    if (filters.priorities.size > 0 && (!task.priority || !filters.priorities.has(task.priority))) {
      return false;
    }
    if (filters.sizes.size > 0 && (!task.size || !filters.sizes.has(task.size))) {
      return false;
    }
    if (
      filters.dueDateStatuses.size > 0 &&
      !filters.dueDateStatuses.has(dueDateStatus(task, today))
    ) {
      return false;
    }
    return (
      filters.completionStatuses.size === 0 ||
      filters.completionStatuses.has(task.done ? "completed" : "open")
    );
  });
}

export function useFilteredTaskIds(taskIds: string[], filters: TaskFilters) {
  const tasks = useTasks();
  const visibleTaskIds = new Set(
    filterTasks(tasks, filters, toIsoDateInput(new Date())).map((task) => task.id),
  );

  return taskIds.filter((taskId) => visibleTaskIds.has(taskId));
}

export function useTaskFilters(projectId: string, page: "kanban" | "backlog") {
  const { tags } = useTags();
  const tagIds = new Set(tags.map((tag) => tag.id));
  const [storedFilters, setStoredFilters] = useState(() => ({
    projectId,
    value: loadFilters(projectId, page),
  }));

  const projectFilters =
    storedFilters.projectId === projectId ? storedFilters.value : loadFilters(projectId, page);
  const filters = { ...projectFilters, tagIds: projectFilters.tagIds.intersection(tagIds) };

  const updateFilters = (update: Partial<TaskFilters>) => {
    const next = { ...projectFilters, ...update };
    setStoredFilters({ projectId, value: next });
    saveFilters(projectId, page, next);
  };

  const clearFilters = () => {
    setStoredFilters({ projectId, value: DEFAULT_FILTERS });
    saveFilters(projectId, page, DEFAULT_FILTERS);
  };

  return { filters, updateFilters, clearFilters };
}
