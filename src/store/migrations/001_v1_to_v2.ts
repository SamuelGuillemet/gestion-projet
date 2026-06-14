import { set } from "idb-keyval";
import type { StorageValue } from "zustand/middleware";

const VERSION_1_KEY = "gestion-projet-store";

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

export const version = 2;

/**
 * Migrate from the old single-blob localStorage format to partitioned IDB keys (v2).
 * Returns true if the migration wrote data and a reload is recommended.
 */
export async function run(): Promise<boolean> {
  const raw = localStorage.getItem(VERSION_1_KEY);
  // Nothing to migrate; still mark migration as applied (caller will advance version)
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as { state?: LegacyState; version?: number };
    const state = parsed.state;
    if (!state) return false;

    const ver = version;

    await Promise.all([
      set("gp-projects", {
        state: {
          projects: state.projects ?? [],
          activeProjectId: state.activeProjectId ?? null,
        },
        version: ver,
      } satisfies StorageValue<unknown>),
      set("gp-tasks", {
        state: { tasks: state.tasks ?? [] },
        version: ver,
      } satisfies StorageValue<unknown>),
      set("gp-tags", {
        state: { tags: state.tags ?? [] },
        version: ver,
      } satisfies StorageValue<unknown>),
      set("gp-notes", {
        state: {
          notes: state.notes ?? [],
          questions: state.questions ?? [],
          deliverables: state.deliverables ?? [],
        },
        version: ver,
      } satisfies StorageValue<unknown>),
      set("gp-time", {
        state: {
          timeEntries: state.timeEntries ?? [],
          milestones: state.milestones ?? [],
        },
        version: ver,
      } satisfies StorageValue<unknown>),
      set("gp-relations", {
        state: { relations: state.relations ?? [] },
        version: ver,
      } satisfies StorageValue<unknown>),
    ]);

    // Remove legacy blob so we don't try to re-run this migration later.
    try {
      localStorage.removeItem(VERSION_1_KEY);
    } catch {}

    return true;
  } catch (e) {
    console.error("[migration v1->v2] Failed:", e);
    return false;
  }
}

export function transform(
  legacy: Record<string, unknown>,
): Record<string, unknown> {
  return {
    "gp-projects": {
      projects: legacy.projects ?? [],
      activeProjectId: legacy.activeProjectId ?? null,
    },
    "gp-tasks": {
      tasks: legacy.tasks ?? [],
    },
    "gp-tags": {
      tags: legacy.tags ?? [],
    },
    "gp-notes": {
      notes: legacy.notes ?? [],
      questions: legacy.questions ?? [],
      deliverables: legacy.deliverables ?? [],
    },
    "gp-time": {
      timeEntries: legacy.timeEntries ?? [],
      milestones: legacy.milestones ?? [],
    },
    "gp-relations": {
      relations: legacy.relations ?? [],
    },
  };
}
