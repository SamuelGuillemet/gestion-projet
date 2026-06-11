import { del, get, set } from "idb-keyval";
import type { PersistStorage, StorageValue } from "zustand/middleware";

/**
 * Creates an IndexedDB-backed storage for zustand persist middleware
 * with debounced writes to avoid excessive serialization on rapid mutations.
 */
export function createIdbStorage<T>(debounceMs = 300): PersistStorage<T> {
  const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

  return {
    getItem: async (name): Promise<StorageValue<T> | null> => {
      const value = await get<StorageValue<T>>(name);
      return value ?? null;
    },

    setItem: (name, value) => {
      // Clear any pending write for this key
      const existing = pendingWrites.get(name);
      if (existing) clearTimeout(existing);

      // Debounce the write
      const timeout = setTimeout(() => {
        pendingWrites.delete(name);
        set(name, value);
      }, debounceMs);

      pendingWrites.set(name, timeout);
    },

    removeItem: (name) => {
      const existing = pendingWrites.get(name);
      if (existing) clearTimeout(existing);
      pendingWrites.delete(name);
      del(name);
    },
  };
}
