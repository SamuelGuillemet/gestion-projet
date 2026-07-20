import { del, get, set } from "idb-keyval";
import type { PersistStorage, StorageValue } from "zustand/middleware";

type PendingWrite = {
  timeout: ReturnType<typeof setTimeout>;
  value: StorageValue<unknown>;
};

const pendingWrites = new Map<string, PendingWrite>();

export async function flushPendingIdbStorageWrites(): Promise<void> {
  const writes = Array.from(pendingWrites.entries());
  if (writes.length === 0) return;

  pendingWrites.clear();
  await Promise.all(
    writes.map(([name, write]) => {
      clearTimeout(write.timeout);
      return set(name, write.value);
    }),
  );
}

export function hasPendingIdbStorageWrites(): boolean {
  return pendingWrites.size > 0;
}

/**
 * Creates an IndexedDB-backed storage for zustand persist middleware
 * with debounced writes to avoid excessive serialization on rapid mutations.
 */
export function createIdbStorage<T>(debounceMs = 300): PersistStorage<T> {
  return {
    getItem: async (name): Promise<StorageValue<T> | null> => {
      const value = await get<StorageValue<T>>(name);
      return value ?? null;
    },

    setItem: (name, value) => {
      // Clear any pending write for this key
      const existing = pendingWrites.get(name);
      if (existing) clearTimeout(existing.timeout);

      // Debounce the write
      const valueToWrite = value as StorageValue<unknown>;
      const timeout = setTimeout(() => {
        const pending = pendingWrites.get(name);
        if (pending?.timeout !== timeout) return;

        pendingWrites.delete(name);
        void set(name, pending.value);
      }, debounceMs);

      pendingWrites.set(name, { timeout, value: valueToWrite });
    },

    removeItem: (name) => {
      const existing = pendingWrites.get(name);
      if (existing) clearTimeout(existing.timeout);
      pendingWrites.delete(name);
      del(name);
    },
  };
}
