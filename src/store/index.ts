import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createNoteSlice, type NoteSlice } from "./slices/note.slice";
import { createProjectSlice, type ProjectSlice } from "./slices/project.slice";
import {
  createRelationSlice,
  type RelationSlice,
} from "./slices/relation.slice";
import { createTagSlice, type TagSlice } from "./slices/tag.slice";
import { createTaskSlice, type TaskSlice } from "./slices/task.slice";
import { createTimeSlice, type TimeSlice } from "./slices/time.slice";

const STORE_VERSION = 1;

export type AppStore = ProjectSlice &
  TaskSlice &
  TagSlice &
  NoteSlice &
  TimeSlice &
  RelationSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createProjectSlice(...a),
      ...createTaskSlice(...a),
      ...createTagSlice(...a),
      ...createNoteSlice(...a),
      ...createTimeSlice(...a),
      ...createRelationSlice(...a),
    }),
    {
      name: "gestion-projet-store",
      version: STORE_VERSION,
    },
  ),
);
