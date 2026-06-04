import type { StateCreator } from "zustand";
import { generateId } from "@/lib/utils";
import type { Tag } from "@/models/tag";

export interface TagSlice {
  tags: Tag[];
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, data: Partial<Pick<Tag, "name" | "color">>) => void;
  deleteTag: (id: string) => void;
}

export const createTagSlice: StateCreator<TagSlice, [], [], TagSlice> = (
  set,
) => ({
  tags: [],

  addTag: (name, color) =>
    set((state) => ({
      tags: [...state.tags, { id: generateId(), name, color }],
    })),

  updateTag: (id, data) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    })),
});
