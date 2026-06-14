import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Section = "tasks" | "questions" | "deliverables";
type DetailSelection = { type: Section; id: string } | null;
interface BacklogUIState {
  selectedDetail: DetailSelection;
  panelSize: string;
  select: (detail: DetailSelection) => void;
  clear: () => void;
  clearIfSelected: (id: string) => void;
  setPanelSize: (panelSize: number) => void;
}

export const useBacklogUI = create<BacklogUIState>()(
  persist(
    (set, get) => ({
      selectedDetail: null,
      panelSize: "35%",
      select: (detail) => set({ selectedDetail: detail }),
      clear: () => set({ selectedDetail: null }),
      clearIfSelected: (id) => {
        if (get().selectedDetail?.id === id) set({ selectedDetail: null });
      },
      setPanelSize: (panelSize) => {
        if (panelSize) {
          set({ panelSize: `${panelSize}%` });
        }
      },
    }),
    {
      name: "backlog-state",
    },
  ),
);
