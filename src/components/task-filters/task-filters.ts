import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { toIsoDateInput } from "@/lib/time";
import type { Tag } from "@/models/tag";
import type { Task, TaskPriority, TaskSize } from "@/models/task";

const FILTER_SCHEMA_VERSION = 1;

export type DueDateStatus = "overdue" | "today" | "upcoming" | "none" | "done";
export type TaskCompletionStatus = "open" | "completed";

export interface TaskFilters {
  query: string;
  tagIds: string[];
  priorities: TaskPriority[];
  sizes: TaskSize[];
  dueDateStatuses: DueDateStatus[];
  completionStatuses: TaskCompletionStatus[];
}

const DEFAULT_FILTERS: TaskFilters = {
  query: "",
  tagIds: [],
  priorities: [],
  sizes: [],
  dueDateStatuses: [],
  completionStatuses: [],
};

function storageKey(projectId: string) {
  return `task-filters:${projectId}`;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function parseFilters(value: string | null, tagIds: Set<string>): TaskFilters {
  if (!value) return DEFAULT_FILTERS;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_FILTERS;
    const data = parsed as Record<string, unknown>;
    if (data.version !== FILTER_SCHEMA_VERSION) return DEFAULT_FILTERS;

    return {
      query: typeof data.query === "string" ? data.query : "",
      tagIds: isStringArray(data.tagIds)
        ? data.tagIds.filter((id) => tagIds.has(id))
        : [],
      priorities: isStringArray(data.priorities)
        ? data.priorities.filter(
            (value): value is TaskPriority =>
              value === "low" || value === "medium" || value === "high",
          )
        : [],
      sizes: isStringArray(data.sizes)
        ? data.sizes.filter(
            (value): value is TaskSize =>
              value === "small" || value === "medium" || value === "large",
          )
        : [],
      dueDateStatuses: isStringArray(data.dueDateStatuses)
        ? data.dueDateStatuses.filter(
            (value): value is DueDateStatus =>
              value === "overdue" ||
              value === "today" ||
              value === "upcoming" ||
              value === "none",
          )
        : [],
      completionStatuses: isStringArray(data.completionStatuses)
        ? data.completionStatuses.filter(
            (value): value is TaskCompletionStatus =>
              value === "open" || value === "completed",
          )
        : [],
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(projectId: string, filters: TaskFilters) {
  try {
    localStorage.setItem(
      storageKey(projectId),
      JSON.stringify({ version: FILTER_SCHEMA_VERSION, ...filters }),
    );
  } catch {
    // Filters remain usable when local storage is unavailable.
  }
}

export function countActiveFilters(filters: TaskFilters) {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.tagIds.length +
    filters.priorities.length +
    filters.sizes.length +
    filters.dueDateStatuses.length +
    filters.completionStatuses.length
  );
}

function dueDateStatus(task: Task, today: string): DueDateStatus {
  if (task.done) return "done";
  if (!task.dueDate) return "none";
  if (task.dueDate < today) return "overdue";
  if (task.dueDate === today) return "today";
  return "upcoming";
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
) {
  const query = filters.query.trim().toLocaleLowerCase();

  return tasks.filter((task) => {
    if (
      query &&
      !`${task.title} ${task.description} #${task.number}`
        .toLocaleLowerCase()
        .includes(query)
    ) {
      return false;
    }
    if (
      filters.tagIds.length > 0 &&
      !task.tags.some((tagId) => filters.tagIds.includes(tagId))
    ) {
      return false;
    }
    if (
      filters.priorities.length > 0 &&
      (!task.priority || !filters.priorities.includes(task.priority))
    ) {
      return false;
    }
    if (
      filters.sizes.length > 0 &&
      (!task.size || !filters.sizes.includes(task.size))
    ) {
      return false;
    }
    if (
      filters.dueDateStatuses.length > 0 &&
      !filters.dueDateStatuses.includes(dueDateStatus(task, today))
    ) {
      return false;
    }
    return (
      filters.completionStatuses.length === 0 ||
      filters.completionStatuses.includes(task.done ? "completed" : "open")
    );
  });
}

export function useFilteredTaskIds(taskIds: string[], filters: TaskFilters) {
  const tasks = useTasks();
  const visibleTaskIds = new Set(
    filterTasks(tasks, filters, toIsoDateInput(new Date())).map(
      (task) => task.id,
    ),
  );

  return taskIds.filter((taskId) => visibleTaskIds.has(taskId));
}

export function useTaskFilters(projectId: string, tags: Tag[]) {
  const tagIds = new Set(tags.map((tag) => tag.id));
  const [filters, setFilters] = useState<TaskFilters>(() => {
    try {
      return parseFilters(localStorage.getItem(storageKey(projectId)), tagIds);
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  useEffect(() => {
    try {
      setFilters(
        parseFilters(localStorage.getItem(storageKey(projectId)), tagIds),
      );
    } catch {
      setFilters(DEFAULT_FILTERS);
    }
  }, [projectId, tags]);

  const updateFilters = (update: Partial<TaskFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...update };
      saveFilters(projectId, next);
      return next;
    });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    saveFilters(projectId, DEFAULT_FILTERS);
  };

  return { filters, updateFilters, clearFilters };
}
