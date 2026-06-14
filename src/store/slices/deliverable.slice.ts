import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Deliverable } from "@/models/deliverable";

export interface DeliverableSlice {
  deliverables: Deliverable[];
  addDeliverable: (projectId: string, title: string) => string;
  updateDeliverable: (
    id: string,
    data: Partial<
      Pick<Deliverable, "title" | "type" | "description" | "version" | "done">
    >,
  ) => void;
  deleteDeliverable: (id: string) => void;
}

export const createDeliverableSlice: StateCreator<
  DeliverableSlice,
  [],
  [],
  DeliverableSlice
> = (set) => ({
  deliverables: [],

  addDeliverable: (projectId, title) => {
    const id = generateId();
    set((state) => ({
      deliverables: [
        ...state.deliverables,
        { id, projectId, title, done: false },
      ],
    }));
    return id;
  },

  updateDeliverable: (id, data) =>
    set((state) => ({
      deliverables: state.deliverables.map((d) =>
        d.id === id ? { ...d, ...data } : d,
      ),
    })),

  deleteDeliverable: (id) =>
    set((state) => ({
      deliverables: state.deliverables.filter((d) => d.id !== id),
    })),
});
