import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTimeEntries } from "@/hooks/useTimeTracking";
import {
  buildWeeklyProjectProgress,
  createDefaultWorkdayDateRange,
  filterTimeEntriesByDates,
  formatMinutes,
  reportByDateAndProject,
  sumTimeEntryMinutes,
  sumWeeklyActualMinutes,
  toWorkdayRangeFromDateSelection,
  type WorkdayRange,
} from "@/lib/time";
import { DailyReport } from "./DailyReport";
import { RangeSelector } from "./RangeSelector";
import { WeeklyCalendarReport } from "./WeeklyCalendarReport";
import { WeeklyProjectList } from "./WeeklyProjectList";

const getPlannedDays = () => {
  const defaultRange = createDefaultWorkdayDateRange(5);
  return toWorkdayRangeFromDateSelection(defaultRange?.from, defaultRange?.to);
};

export function ActivityReportPage() {
  const [windowRange, setWindowRange] = useState<WorkdayRange>(getPlannedDays);

  const [plannedDaysState, setPlannedDaysState] = useState<Record<string, number>>({});

  const timeEntries = useTimeEntries();
  const tasks = useTasks();
  const { projects } = useProjects();

  const windowEntries = filterTimeEntriesByDates(timeEntries, windowRange?.workdayDates ?? []);

  const weeklyProgress = buildWeeklyProjectProgress(projects, windowEntries, plannedDaysState);

  const report = reportByDateAndProject(timeEntries, projects, tasks);
  const grandTotal = sumTimeEntryMinutes(timeEntries);
  const windowActualTotal = sumWeeklyActualMinutes(weeklyProgress);

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid h-full min-h-0 grid-cols-activity-report gap-6 p-4">
        {/* LEFT — 60% */}
        <div className="flex h-full min-h-0 min-w-0 flex-col gap-6">
          {/* Range follow — 50% */}
          <div className="flex h-1/2 min-h-0 flex-col space-y-3 overflow-hidden rounded-lg border p-3">
            <div className="shrink-0 text-sm font-medium">Suivi sur plage de dates</div>

            <RangeSelector
              onWindowRangeChange={setWindowRange}
              windowActualTotal={windowActualTotal}
            />

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun projet à afficher.</p>
              ) : (
                <WeeklyProjectList
                  weeklyProgress={weeklyProgress}
                  onPlannedDaysByProjectIdChange={setPlannedDaysState}
                />
              )}
            </div>
          </div>

          {/* Calendar — 50% */}
          <div className="flex h-1/2 min-h-0 flex-col space-y-3">
            <div className="shrink-0 text-sm font-medium">Calendrier</div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
              <WeeklyCalendarReport timeEntries={timeEntries} tasks={tasks} projects={projects} />
            </div>
          </div>
        </div>

        {/* RIGHT — 40% */}
        <div className="flex h-full min-h-0 min-w-0 flex-col space-y-4">
          <div className="flex shrink-0 items-center justify-between">
            <div className="text-sm font-medium">Récapitulatif quotidien</div>

            <div className="text-sm text-muted-foreground">
              Total général : <strong>{formatMinutes(grandTotal)}</strong>
            </div>
          </div>

          {/* Only this area scrolls */}
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <DailyReport report={report} />
          </div>
        </div>
      </div>
    </div>
  );
}
