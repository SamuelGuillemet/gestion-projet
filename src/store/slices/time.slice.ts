import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Milestone } from "@/models/milestone";
import type { TimeEntry } from "@/models/time-entry";

export interface TimeSlice {
  timeEntries: TimeEntry[];
  milestones: Milestone[];
  addTimeEntry: (
    taskId: string,
    projectId: string,
    date: string,
    minutes: number,
  ) => void;
  updateTimeEntry: (
    id: string,
    data: Partial<Pick<TimeEntry, "date" | "minutes">>,
  ) => void;
  deleteTimeEntry: (id: string) => void;
  addMilestone: (
    projectId: string,
    name: string,
    date: string,
    description?: string,
  ) => void;
  updateMilestone: (
    id: string,
    data: Partial<Pick<Milestone, "name" | "date" | "description">>,
  ) => void;
  deleteMilestone: (id: string) => void;
}

export const createTimeSlice: StateCreator<TimeSlice, [], [], TimeSlice> = (
  set,
) => ({
  timeEntries: [],
  milestones: [],

  addTimeEntry: (taskId, projectId, date, minutes) =>
    set((state) => ({
      timeEntries: [
        ...state.timeEntries,
        { id: generateId(), taskId, projectId, date, minutes },
      ],
    })),

  updateTimeEntry: (id, data) =>
    set((state) => ({
      timeEntries: state.timeEntries.map((e) =>
        e.id === id ? { ...e, ...data } : e,
      ),
    })),

  deleteTimeEntry: (id) =>
    set((state) => ({
      timeEntries: state.timeEntries.filter((e) => e.id !== id),
    })),

  addMilestone: (projectId, name, date, description) =>
    set((state) => ({
      milestones: [
        ...state.milestones,
        { id: generateId(), projectId, name, date, description },
      ],
    })),

  updateMilestone: (id, data) =>
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, ...data } : m,
      ),
    })),

  deleteMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
    })),
});
