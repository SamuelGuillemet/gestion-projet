import { create } from "zustand";
import { persist } from "zustand/middleware";

type NotesUIState = {
  activeNoteIdByProjectId: Record<string, string>;
  setActiveNoteId: (projectId: string, noteId: string | null) => void;
};

export const useNotesUI = create<NotesUIState>()(
  persist(
    (set) => ({
      activeNoteIdByProjectId: {},
      setActiveNoteId: (projectId, noteId) =>
        set((state) => {
          const next = { ...state.activeNoteIdByProjectId };
          if (noteId) next[projectId] = noteId;
          else delete next[projectId];
          return { activeNoteIdByProjectId: next };
        }),
    }),
    {
      name: "notes-state",
    },
  ),
);

export function useActiveNoteId(projectId: string) {
  const activeNoteIdByProjectId = useNotesUI(
    (state) => state.activeNoteIdByProjectId,
  );

  return activeNoteIdByProjectId[projectId] ?? null;
}
