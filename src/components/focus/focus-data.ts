import { useMemo } from "react";
import {
  DONE_COLUMN_ID,
  IN_PROGRESS_COLUMN_ID,
  TODO_COLUMN_ID,
  WAITING_COLUMN_ID,
} from "@/constants/board-columns";
import { DAY_MS, DUE_SOON_DAYS, STALE_DAYS } from "@/constants/task-options";
import { useProjects } from "@/hooks/useProjects";
import { useQuestions } from "@/hooks/useQuestions";
import { useTasks } from "@/hooks/useTasks";
import { useTimeEntries } from "@/hooks/useTimeTracking";
import { toIsoDateInput } from "@/lib/time";
import type { Project } from "@/models/project";
import type { Question } from "@/models/question";
import type { Task } from "@/models/task";
import type { TimeEntry } from "@/models/time-entry";

export interface ProjectSummary {
  project: Project;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  todoTasks: number;
  inProgressTasks: number;
  waitingTasks: number;
  weekMinutes: number;
  unansweredQuestions: number;
  overdueTasks: number;
  dueSoonTasks: number;
}

export type FocusOverviewItem =
  | { type: "task"; task: Task; project: Project | null }
  | { type: "question"; question: Question; project: Project | null };

export interface StaleFocusTask {
  task: Task;
  project: Project | null;
  staleDays: number;
}

interface FocusDates {
  todayKey: string;
  todayDate: Date;
  dueSoonEndKey: string;
  weekStartKey: string;
  dateLabel: string;
}

interface VisibleFocusRecords {
  visibleProjects: Project[];
  visibleTasks: Task[];
  visibleQuestions: Question[];
  visibleTimeEntries: TimeEntry[];
  projectById: Map<string, Project>;
  openTasks: Task[];
}

export function useFocusDashboardData(hiddenProjectIds: Set<string>) {
  const { projects } = useProjects();
  const tasks = useTasks();
  const questions = useQuestions();
  const timeEntries = useTimeEntries();
  const dates = useFocusDates();
  const visibleRecords = useVisibleFocusRecords(
    projects,
    tasks,
    questions,
    timeEntries,
    hiddenProjectIds,
  );
  const projectSummaries = useFocusProjectSummaries(visibleRecords, dates);
  const overview = useFocusOverviewItems(
    visibleRecords.openTasks,
    visibleRecords.visibleQuestions,
    visibleRecords.projectById,
    dates.todayKey,
    dates.dueSoonEndKey,
  );
  const staleTasks = useFocusStaleTasks(
    visibleRecords.openTasks,
    visibleRecords.projectById,
    dates.todayDate,
  );

  return {
    projects,
    dateLabel: dates.dateLabel,
    openTasks: visibleRecords.openTasks,
    projectSummaries,
    staleTasks,
    ...overview,
  };
}

function useFocusDates(): FocusDates {
  const todayKey = toIsoDateInput(new Date());

  return useMemo(() => {
    const todayDate = parseIsoDate(todayKey) ?? new Date();

    return {
      todayKey,
      todayDate,
      dueSoonEndKey: toIsoDateInput(addDays(todayDate, DUE_SOON_DAYS)),
      weekStartKey: toIsoDateInput(getWeekStart(todayDate)),
      dateLabel: formatTodayLabel(todayKey),
    };
  }, [todayKey]);
}

function useVisibleFocusRecords(
  projects: Project[],
  tasks: Task[],
  questions: Question[],
  timeEntries: TimeEntry[],
  hiddenProjectIds: Set<string>,
): VisibleFocusRecords {
  return useMemo(() => {
    const visibleProjects = projects.filter(
      (project) => !hiddenProjectIds.has(project.id),
    );
    const visibleProjectIds = new Set(
      visibleProjects.map((project) => project.id),
    );
    const visibleTasks = tasks.filter((task) =>
      visibleProjectIds.has(task.projectId),
    );
    const visibleQuestions = questions.filter((question) =>
      visibleProjectIds.has(question.projectId),
    );
    const visibleTimeEntries = timeEntries.filter((entry) =>
      visibleProjectIds.has(entry.projectId),
    );
    const projectById = new Map(
      visibleProjects.map((project) => [project.id, project]),
    );

    return {
      visibleProjects,
      visibleTasks,
      visibleQuestions,
      visibleTimeEntries,
      projectById,
      openTasks: visibleTasks.filter(isOpenTask),
    };
  }, [hiddenProjectIds, projects, questions, tasks, timeEntries]);
}

function useFocusProjectSummaries(
  {
    visibleProjects,
    visibleTasks,
    visibleQuestions,
    visibleTimeEntries,
  }: VisibleFocusRecords,
  { todayKey, dueSoonEndKey, weekStartKey }: FocusDates,
) {
  return useMemo(
    () =>
      visibleProjects
        .map((project): ProjectSummary => {
          const projectTasks = visibleTasks.filter(
            (task) => task.projectId === project.id,
          );
          const projectOpenTasks = projectTasks.filter(isOpenTask);
          const projectQuestions = visibleQuestions.filter(
            (question) => question.projectId === project.id,
          );
          const projectWeekMinutes = visibleTimeEntries
            .filter(
              (entry) =>
                entry.projectId === project.id &&
                entry.date >= weekStartKey &&
                entry.date <= todayKey,
            )
            .reduce((sum, entry) => sum + entry.minutes, 0);
          const completedTasks = projectTasks.filter(isCompletedTask).length;

          return {
            project,
            totalTasks: projectTasks.length,
            completedTasks,
            progress:
              projectTasks.length > 0
                ? Math.round((completedTasks / projectTasks.length) * 100)
                : 0,
            todoTasks: projectOpenTasks.filter(
              (task) => task.columnId === TODO_COLUMN_ID,
            ).length,
            inProgressTasks: projectOpenTasks.filter(
              (task) => task.columnId === IN_PROGRESS_COLUMN_ID,
            ).length,
            waitingTasks: projectOpenTasks.filter(
              (task) => task.columnId === WAITING_COLUMN_ID,
            ).length,
            weekMinutes: projectWeekMinutes,
            unansweredQuestions: projectQuestions.filter(
              (question) => question.status !== "resolved",
            ).length,
            overdueTasks: projectOpenTasks.filter((task) =>
              isTaskOverdue(task, todayKey),
            ).length,
            dueSoonTasks: projectOpenTasks.filter((task) =>
              isTaskDueSoon(task, todayKey, dueSoonEndKey),
            ).length,
          };
        })
        .sort((leftSummary, rightSummary) => {
          const rightOpenTasks =
            rightSummary.todoTasks +
            rightSummary.inProgressTasks +
            rightSummary.waitingTasks;
          const leftOpenTasks =
            leftSummary.todoTasks +
            leftSummary.inProgressTasks +
            leftSummary.waitingTasks;
          if (rightOpenTasks !== leftOpenTasks) {
            return rightOpenTasks - leftOpenTasks;
          }
          return leftSummary.project.name.localeCompare(
            rightSummary.project.name,
          );
        }),
    [
      dueSoonEndKey,
      todayKey,
      visibleProjects,
      visibleQuestions,
      visibleTasks,
      visibleTimeEntries,
      weekStartKey,
    ],
  );
}

function useFocusOverviewItems(
  openTasks: Task[],
  visibleQuestions: Question[],
  projectById: Map<string, Project>,
  todayKey: string,
  dueSoonEndKey: string,
) {
  return useMemo(() => {
    const inProgressTasks = openTasks
      .filter((task) => task.columnId === IN_PROGRESS_COLUMN_ID)
      .sort(compareFocusTasks);
    const todoTasks = openTasks
      .filter((task) => task.columnId === TODO_COLUMN_ID)
      .sort(compareNextTodoTasks);
    const dueTasks = openTasks
      .filter(
        (task) =>
          isTaskOverdue(task, todayKey) ||
          isTaskDueSoon(task, todayKey, dueSoonEndKey),
      )
      .sort(compareFocusTasks);
    const focusTasks = uniqueFocusTasks([...inProgressTasks, ...dueTasks]);
    const focusTaskIds = new Set(focusTasks.map((task) => task.id));
    const notStartedTasks = todoTasks.filter(
      (task) => !focusTaskIds.has(task.id),
    );
    const notStartedItems: FocusOverviewItem[] = [
      ...notStartedTasks.map((task) => toTaskOverviewItem(task, projectById)),
      ...visibleQuestions
        .filter((question) => question.status === "to-ask")
        .map((question) => toQuestionOverviewItem(question, projectById)),
    ].sort(compareOverviewItems);
    const priorityItems: FocusOverviewItem[] = focusTasks.map((task) =>
      toTaskOverviewItem(task, projectById),
    );
    const blockedItems: FocusOverviewItem[] = [
      ...openTasks
        .filter(
          (task) =>
            task.columnId === WAITING_COLUMN_ID && !focusTaskIds.has(task.id),
        )
        .map((task) => toTaskOverviewItem(task, projectById)),
      ...visibleQuestions
        .filter((question) => question.status === "pending")
        .map((question) => toQuestionOverviewItem(question, projectById)),
    ].sort(compareOverviewItems);

    return {
      inProgressTasks,
      todoTasks: notStartedTasks,
      blockedItems,
      notStartedItems,
      priorityItems,
    };
  }, [dueSoonEndKey, openTasks, projectById, todayKey, visibleQuestions]);
}

function useFocusStaleTasks(
  openTasks: Task[],
  projectById: Map<string, Project>,
  todayDate: Date,
) {
  return useMemo(
    () =>
      openTasks
        .map(
          (task): StaleFocusTask => ({
            task,
            project: projectById.get(task.projectId) ?? null,
            staleDays: getTaskStaleDays(task, todayDate),
          }),
        )
        .filter((item) => item.staleDays >= STALE_DAYS)
        .sort(
          (leftItem, rightItem) => rightItem.staleDays - leftItem.staleDays,
        ),
    [openTasks, projectById, todayDate],
  );
}

function isOpenTask(task: Task) {
  return task.columnId !== DONE_COLUMN_ID && !task.done;
}

function isCompletedTask(task: Task) {
  return task.columnId === DONE_COLUMN_ID || task.done;
}

function isTaskOverdue(task: Task, todayKey: string) {
  return Boolean(task.dueDate && task.dueDate < todayKey && isOpenTask(task));
}

function isTaskDueSoon(task: Task, todayKey: string, dueSoonEndKey: string) {
  return Boolean(
    task.dueDate &&
      task.dueDate >= todayKey &&
      task.dueDate <= dueSoonEndKey &&
      isOpenTask(task),
  );
}

function compareFocusTasks(leftTask: Task, rightTask: Task) {
  const leftDueDate = leftTask.dueDate ?? "9999-12-31";
  const rightDueDate = rightTask.dueDate ?? "9999-12-31";
  if (leftDueDate !== rightDueDate) {
    return leftDueDate.localeCompare(rightDueDate);
  }
  return (
    getPriorityWeight(rightTask.priority) - getPriorityWeight(leftTask.priority)
  );
}

function compareNextTodoTasks(leftTask: Task, rightTask: Task) {
  const focusComparison = compareFocusTasks(leftTask, rightTask);
  if (focusComparison !== 0) return focusComparison;
  if (leftTask.order !== rightTask.order) {
    return leftTask.order - rightTask.order;
  }
  return leftTask.title.localeCompare(rightTask.title);
}

function uniqueFocusTasks(tasks: Task[]) {
  const seenTaskIds = new Set<string>();
  return tasks.filter((task) => {
    if (seenTaskIds.has(task.id)) return false;
    seenTaskIds.add(task.id);
    return true;
  });
}

function toTaskOverviewItem(
  task: Task,
  projectById: Map<string, Project>,
): FocusOverviewItem {
  return {
    type: "task",
    task,
    project: projectById.get(task.projectId) ?? null,
  };
}

function toQuestionOverviewItem(
  question: Question,
  projectById: Map<string, Project>,
): FocusOverviewItem {
  return {
    type: "question",
    question,
    project: projectById.get(question.projectId) ?? null,
  };
}

function compareOverviewItems(
  leftItem: FocusOverviewItem,
  rightItem: FocusOverviewItem,
) {
  const leftProjectName = getOverviewProjectName(leftItem);
  const rightProjectName = getOverviewProjectName(rightItem);
  if (leftProjectName !== rightProjectName) {
    return leftProjectName.localeCompare(rightProjectName);
  }
  return getOverviewNumber(leftItem) - getOverviewNumber(rightItem);
}

function getOverviewProjectName(item: FocusOverviewItem) {
  return item.project?.name ?? "";
}

function getOverviewNumber(item: FocusOverviewItem) {
  return item.type === "task" ? item.task.number : item.question.number;
}

function getPriorityWeight(priority: Task["priority"]) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  if (priority === "low") return 1;
  return 0;
}

function getTaskStaleDays(task: Task, todayDate: Date) {
  const activityDate = task.updatedAt ?? task.createdAt;
  if (!activityDate) return 0;
  const parsedDate = new Date(activityDate);
  if (Number.isNaN(parsedDate.getTime())) return 0;
  return Math.max(
    0,
    Math.floor((todayDate.getTime() - parsedDate.getTime()) / DAY_MS),
  );
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatTodayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
