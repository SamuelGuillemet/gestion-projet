import { create } from "zustand";
import { persist } from "zustand/middleware";

type NotesUIState = {
  activeNoteIdByProjectId: Record<string, string>;
  collapsedFolderIds: Record<string, true>;
  setActiveNoteId: (projectId: string, noteId: string | null) => void;
  setFolderCollapsed: (folderId: string, collapsed: boolean) => void;
};

export const useNotesUI = create<NotesUIState>()(
  persist(
    (set) => ({
      activeNoteIdByProjectId: {},
      collapsedFolderIds: {},
      setActiveNoteId: (projectId, noteId) =>
        set((state) => {
          const next = { ...state.activeNoteIdByProjectId };
          if (noteId) next[projectId] = noteId;
          else delete next[projectId];
          return { activeNoteIdByProjectId: next };
        }),
      setFolderCollapsed: (folderId, collapsed) =>
        set((state) => {
          const next = { ...state.collapsedFolderIds };
          if (collapsed) next[folderId] = true;
          else delete next[folderId];
          return { collapsedFolderIds: next };
        }),
    }),
    {
      name: "notes-state",
    },
  ),
);

export function useActiveNoteId(projectId: string) {
  const activeNoteIdByProjectId = useNotesUI((state) => state.activeNoteIdByProjectId);

  return activeNoteIdByProjectId[projectId] ?? null;
}
