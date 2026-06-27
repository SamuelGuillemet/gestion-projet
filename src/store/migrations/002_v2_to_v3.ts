import { get, set } from "idb-keyval";
import { migrateVersion } from "./utils";

export const version = 3;

type GPNotesStore = {
  state: {
    notes: unknown[];
    questions: unknown[];
    deliverables: unknown[];
  };
  version: number;
};

/**
 * Split `questions` and `deliverables` out of `gp-notes` into their own keys.
 * Returns true if writes were performed and a reload is recommended.
 */
export async function run(): Promise<boolean> {
  try {
    const noteStore: GPNotesStore | undefined = await get("gp-notes");
    if (noteStore === undefined) return false;

    const notes = noteStore.state.notes ?? [];
    const questions = noteStore.state.questions ?? [];
    const deliverables = noteStore.state.deliverables ?? [];

    const ver = version;

    await Promise.all([
      set("gp-questions", { state: { questions: questions }, version: ver }),
      set("gp-deliverables", {
        state: { deliverables: deliverables },
        version: ver,
      }),
      set("gp-notes", { state: { notes: notes }, version: ver }),
      migrateVersion("gp-projects", version),
      migrateVersion("gp-relations", version),
      migrateVersion("gp-tags", version),
      migrateVersion("gp-tasks", version),
      migrateVersion("gp-time", version),
    ]);

    return true;
  } catch (e) {
    console.error("[migration v2->v3] Failed:", e);
    return false;
  }
}

export function transform(
  legacy: Record<string, unknown>,
): Record<string, unknown> {
  const notesStore = legacy["gp-notes"] as GPNotesStore["state"];

  return {
    ...legacy,
    "gp-notes": { notes: notesStore.notes },
    "gp-questions": { questions: notesStore.questions },
    "gp-deliverables": { deliverables: notesStore.deliverables },
  };
}
