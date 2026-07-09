import type { Project } from "@/models/project";
import type { Task } from "@/models/task";
import type { TimeEntry } from "@/models/time-entry";

const MINUTES_PER_DAY = 8 * 60;
const FR_LOCALE = "fr-FR";

export interface WorkdayRange {
  startDate: string;
  endDate: string;
  workdayDates: string[];
}

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
  tasks: Task[],
) {
  const byDate: Record<
    string,
    Record<string, { minutes: number; taskMinutesByTaskId: Record<string, number> }>
  > = {};

  for (const entry of timeEntries) {
    if (!byDate[entry.date]) byDate[entry.date] = {};
    if (!byDate[entry.date][entry.projectId]) {
      byDate[entry.date][entry.projectId] = {
        minutes: 0,
        taskMinutesByTaskId: {},
      };
    }
    byDate[entry.date][entry.projectId].minutes += entry.minutes;
    const taskMinutesByTaskId = byDate[entry.date][entry.projectId].taskMinutesByTaskId;
    taskMinutesByTaskId[entry.taskId] =
      (taskMinutesByTaskId[entry.taskId] ?? 0) + entry.minutes;
  }

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return dates.map((date) => ({
    date,
    projects: Object.entries(byDate[date]).map(([projectId, projectData]) => {
      const project = projects.find((p) => p.id === projectId);
      const tasksBreakdown = Object.entries(projectData.taskMinutesByTaskId)
        .map(([taskId, minutes]) => {
          const task = tasks.find((t) => t.id === taskId);
          return {
            taskId,
            taskNumber: task?.number ?? -1,
            taskTitle: task?.title ?? "Tache supprimee",
            minutes,
          };
        })
        .sort((a, b) => b.minutes - a.minutes);

      return {
        projectId,
        projectName: project?.name ?? "Projet supprimé",
        projectColor: project?.color ?? "#888",
        minutes: projectData.minutes,
        tasksBreakdown,
      };
    }),
    total: Object.values(byDate[date]).reduce(
      (sum, projectData) => sum + projectData.minutes,
      0,
    ),
  }));
}

export function toIsoDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isWorkday(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function getWorkdayDatesInRange(
  fromDate: string,
  toDate: string,
): string[] {
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);

  if (start > end) {
    return [];
  }

  const cursor = new Date(start);
  const dates: string[] = [];

  while (cursor <= end) {
    if (isWorkday(cursor)) {
      dates.push(toIsoDateInput(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function getRollingWorkdayDates(
  windowEndDate: string,
  dayCount = 5,
): string[] {
  const cursor = new Date(`${windowEndDate}T00:00:00`);
  const dates: string[] = [];

  while (dates.length < dayCount) {
    if (isWorkday(cursor)) {
      dates.push(toIsoDateInput(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates.reverse();
}

export function getRollingWorkdayRange(
  windowEndDate: string,
  dayCount = 5,
): WorkdayRange {
  const workdayDates = getRollingWorkdayDates(windowEndDate, dayCount);
  return {
    startDate: workdayDates[0] ?? windowEndDate,
    endDate: workdayDates[workdayDates.length - 1] ?? windowEndDate,
    workdayDates,
  };
}

export function createDefaultWorkdayDateRange(
  dayCount = 5,
  yesterday = new Date(new Date().setDate(new Date().getDate() - 1)),
): { from: Date; to: Date } {
  const defaultRange = getRollingWorkdayRange(
    toIsoDateInput(yesterday),
    dayCount,
  );
  return {
    from: new Date(`${defaultRange.startDate}T00:00:00`),
    to: new Date(`${defaultRange.endDate}T00:00:00`),
  };
}

export function toWorkdayRangeFromDateSelection(
  from?: Date,
  to?: Date,
): WorkdayRange {
  if (!from || !to) {
    return {
      startDate: "",
      endDate: "",
      workdayDates: [],
    };
  }

  const startDate = toIsoDateInput(from);
  const endDate = toIsoDateInput(to);

  return {
    startDate,
    endDate,
    workdayDates: getWorkdayDatesInRange(startDate, endDate),
  };
}

export function isValidPlannedDaysInput(value: string): boolean {
  return /^\d*([.,]\d*)?$/.test(value);
}

export function parsePlannedDaysByProject(
  inputByProjectId: Record<string, string>,
): Record<string, number> {
  const parsed: Record<string, number> = {};
  for (const [projectId, rawValue] of Object.entries(inputByProjectId)) {
    const normalized = rawValue.replace(",", ".");
    const value = Number.parseFloat(normalized);
    parsed[projectId] = Number.isNaN(value) ? 0 : Math.max(0, value);
  }
  return parsed;
}

export function sumTimeEntryMinutes(timeEntries: TimeEntry[]): number {
  return timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);
}

export function sumWeeklyActualMinutes(
  weeklyProgress: WeeklyProjectProgress[],
): number {
  return weeklyProgress.reduce(
    (sum, project) => sum + project.actualMinutes,
    0,
  );
}

export function formatShortDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(FR_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatLongDateLabel(date: string): string {
  const sDate = new Date(`${date}T00:00:00`).toLocaleDateString(FR_LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // Uppercase the first letter of the weekday
  return sDate.charAt(0).toUpperCase() + sDate.slice(1);
}

export function filterTimeEntriesByDates(
  timeEntries: TimeEntry[],
  allowedDates: string[],
): TimeEntry[] {
  const allowedDatesSet = new Set(allowedDates);
  return timeEntries.filter((entry) => {
    return allowedDatesSet.has(entry.date);
  });
}

export interface WeeklyProjectProgress {
  projectId: string;
  projectName: string;
  projectColor: string;
  actualMinutes: number;
  completionPercent: number;
  overflowMinutes: number;
}

export function buildWeeklyProjectProgress(
  projects: Project[],
  windowEntries: TimeEntry[],
  plannedDaysByProjectId: Record<string, number>,
): WeeklyProjectProgress[] {
  const minutesByProject: Record<string, number> = {};

  for (const entry of windowEntries) {
    if (!minutesByProject[entry.projectId]) {
      minutesByProject[entry.projectId] = 0;
    }
    minutesByProject[entry.projectId] += entry.minutes;
  }

  return projects
    .map((project) => {
      const plannedDays = Math.max(0, plannedDaysByProjectId[project.id] ?? 0);
      const plannedMinutes = Math.round(plannedDays * MINUTES_PER_DAY);
      const actualMinutes = minutesByProject[project.id] ?? 0;
      const completionPercent =
        plannedMinutes > 0
          ? Math.min(100, (actualMinutes / plannedMinutes) * 100)
          : 0;

      return {
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
        plannedDays,
        plannedMinutes,
        actualMinutes,
        actualDays: actualMinutes / MINUTES_PER_DAY,
        completionPercent,
        overflowMinutes: Math.max(0, actualMinutes - plannedMinutes),
      };
    })
    .sort((a, b) => {
      if (b.actualDays !== a.actualDays) {
        return b.actualDays - a.actualDays;
      }
      return a.projectName.localeCompare(b.projectName);
    });
}
