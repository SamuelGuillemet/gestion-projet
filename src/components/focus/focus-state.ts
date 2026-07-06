import { useState } from "react";

export type FocusDetailSelection =
  | { type: "task"; id: string }
  | { type: "question"; id: string }
  | null;

export function useFocusSelection() {
  const [selectedDetail, setSelectedDetail] =
    useState<FocusDetailSelection>(null);

  return {
    selectedDetail,
    selectTask: (taskId: string) =>
      setSelectedDetail({ type: "task", id: taskId }),
    selectQuestion: (questionId: string) =>
      setSelectedDetail({ type: "question", id: questionId }),
    clearSelection: () => setSelectedDetail(null),
  };
}

export function useFocusProjectVisibility() {
  const [hiddenProjectIds, setHiddenProjectIds] = useState<Set<string>>(
    () => new Set(),
  );

  const setProjectVisible = (projectId: string, visible: boolean) => {
    setHiddenProjectIds((currentProjectIds) => {
      const nextProjectIds = new Set(currentProjectIds);
      if (visible) {
        nextProjectIds.delete(projectId);
      } else {
        nextProjectIds.add(projectId);
      }
      return nextProjectIds;
    });
  };

  return {
    hiddenProjectIds,
    setProjectVisible,
    showAllProjects: () => setHiddenProjectIds(new Set()),
  };
}
