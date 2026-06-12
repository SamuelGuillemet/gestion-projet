import type { Project } from "@/models/project";
import type { TimeEntry } from "@/models/time-entry";

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function reportByDateAndProject(
  timeEntries: TimeEntry[],
  projects: Project[],
) {
  const byDate: Record<string, Record<string, number>> = {};

  for (const entry of timeEntries) {
    if (!byDate[entry.date]) byDate[entry.date] = {};
    if (!byDate[entry.date][entry.projectId])
      byDate[entry.date][entry.projectId] = 0;
    byDate[entry.date][entry.projectId] += entry.minutes;
  }

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return dates.map((date) => ({
    date,
    projects: Object.entries(byDate[date]).map(([projectId, minutes]) => {
      const project = projects.find((p) => p.id === projectId);
      return {
        projectId,
        projectName: project?.name ?? "Projet supprimé",
        projectColor: project?.color ?? "#888",
        minutes,
      };
    }),
    total: Object.values(byDate[date]).reduce((sum, m) => sum + m, 0),
  }));
}
