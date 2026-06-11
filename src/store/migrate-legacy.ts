import { set } from "idb-keyval";
import type { StorageValue } from "zustand/middleware";

const LEGACY_KEY = "gestion-projet-store";
const MIGRATION_DONE_KEY = "gp-migration-done";

interface LegacyState {
  projects: unknown[];
  activeProjectId: string | null;
  tasks: unknown[];
  tags: unknown[];
  notes: unknown[];
  questions: unknown[];
  deliverables: unknown[];
  timeEntries: unknown[];
  milestones: unknown[];
  relations: unknown[];
}

/**
 * Migrates data from the old single-blob localStorage store
 * into the new partitioned IndexedDB stores.
 * Should be called once at app startup before stores hydrate.
 */
export async function migrateLegacyStorage(): Promise<void> {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_DONE_KEY)) return;

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATION_DONE_KEY, "1");
    return;
  }

  try {
    const parsed = JSON.parse(raw) as { state?: LegacyState; version?: number };
    const state = parsed.state;
    if (!state) {
      localStorage.setItem(MIGRATION_DONE_KEY, "1");
      return;
    }

    const version = 2;

    // Distribute state to individual IndexedDB keys
    await Promise.all([
      set("gp-projects", {
        state: {
          projects: state.projects ?? [],
          activeProjectId: state.activeProjectId ?? null,
        },
        version,
      } satisfies StorageValue<unknown>),
      set("gp-tasks", {
        state: { tasks: state.tasks ?? [] },
        version,
      } satisfies StorageValue<unknown>),
      set("gp-tags", {
        state: { tags: state.tags ?? [] },
        version,
      } satisfies StorageValue<unknown>),
      set("gp-notes", {
        state: {
          notes: state.notes ?? [],
          questions: state.questions ?? [],
          deliverables: state.deliverables ?? [],
        },
        version,
      } satisfies StorageValue<unknown>),
      set("gp-time", {
        state: {
          timeEntries: state.timeEntries ?? [],
          milestones: state.milestones ?? [],
        },
        version,
      } satisfies StorageValue<unknown>),
      set("gp-relations", {
        state: { relations: state.relations ?? [] },
        version,
      } satisfies StorageValue<unknown>),
    ]);

    // Remove old localStorage entry
    // localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(MIGRATION_DONE_KEY, "1");
    // Reload the page to let stores rehydrate with new data
    window.location.reload();
  } catch (e) {
    console.error("[migration] Failed to migrate legacy storage:", e);
  }
}
