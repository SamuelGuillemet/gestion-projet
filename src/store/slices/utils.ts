type ProjectNumberedItem = {
  projectId: string;
  number?: number | null;
};

export function getNextProjectScopedNumber(
  items: ProjectNumberedItem[],
  projectId: string,
) {
  return (
    Math.max(
      0,
      ...items
        .filter((item) => item.projectId === projectId)
        .map((item) => item.number ?? 0),
    ) + 1
  );
}
