import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORE_VERSION } from "./constants";
import { createIdbStorage } from "./idb-storage";
import { cleanupMarkdownImages } from "./markdown-image.store";
import {
  createDeliverableSlice,
  type DeliverableSlice,
} from "./slices/deliverable.slice";
import { createNoteSlice, type NoteSlice } from "./slices/note.slice";
import { createProjectSlice, type ProjectSlice } from "./slices/project.slice";
import {
  createQuestionSlice,
  type QuestionSlice,
} from "./slices/question.slice";
import {
  createRelationSlice,
  type RelationSlice,
} from "./slices/relation.slice";
import { createTagSlice, type TagSlice } from "./slices/tag.slice";
import { createTaskSlice, type TaskSlice } from "./slices/task.slice";
import { createTimeSlice, type TimeSlice } from "./slices/time.slice";

export const useProjectStore = create<ProjectSlice>()(
  persist(createProjectSlice, {
    name: "gp-projects",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({
      projects: s.projects,
      activeProjectId: s.activeProjectId,
    }),
  }),
);

export const useTaskStore = create<TaskSlice>()(
  persist(createTaskSlice, {
    name: "gp-tasks",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({ tasks: s.tasks }),
  }),
);

export const useTagStore = create<TagSlice>()(
  persist(createTagSlice, {
    name: "gp-tags",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({ tags: s.tags }),
  }),
);

export const useNoteStore = create<NoteSlice>()(
  persist(createNoteSlice, {
    name: "gp-notes",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    onRehydrateStorage: () => (state) => {
      if (!state) return;
      void cleanupMarkdownImages(state.notes.map((note) => note.content));
    },
    partialize: (s) => ({
      notes: s.notes,
    }),
  }),
);

export const useQuestionStore = create<QuestionSlice>()(
  persist(createQuestionSlice, {
    name: "gp-questions",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({ questions: s.questions }),
  }),
);

export const useDeliverableStore = create<DeliverableSlice>()(
  persist(createDeliverableSlice, {
    name: "gp-deliverables",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({ deliverables: s.deliverables }),
  }),
);

export const useTimeStore = create<TimeSlice>()(
  persist(createTimeSlice, {
    name: "gp-time",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({
      timeEntries: s.timeEntries,
      milestones: s.milestones,
    }),
  }),
);

export const useRelationStore = create<RelationSlice>()(
  persist(createRelationSlice, {
    name: "gp-relations",
    version: STORE_VERSION,
    storage: createIdbStorage(),
    partialize: (s) => ({ relations: s.relations }),
  }),
);
