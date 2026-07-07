import { useEffect, useState } from "react";

const HIDDEN_PROJECT_IDS_STORAGE_KEY = "gp-focus-hidden-project-ids";

function loadHiddenProjectIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const rawValue = window.localStorage.getItem(
      HIDDEN_PROJECT_IDS_STORAGE_KEY,
    );
    if (!rawValue) return new Set<string>();

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return new Set<string>();

    return new Set(
      parsedValue.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function persistHiddenProjectIds(hiddenProjectIds: Set<string>) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    HIDDEN_PROJECT_IDS_STORAGE_KEY,
    JSON.stringify([...hiddenProjectIds]),
  );
}

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
  const [hiddenProjectIds, setHiddenProjectIds] = useState<Set<string>>(() =>
    loadHiddenProjectIds(),
  );

  useEffect(() => {
    persistHiddenProjectIds(hiddenProjectIds);
  }, [hiddenProjectIds]);

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
