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

  const [plannedDaysState, setPlannedDaysState] = useState<
    Record<string, number>
  >({});

  const timeEntries = useTimeEntries();
  const tasks = useTasks();
  const { projects } = useProjects();

  const windowEntries = filterTimeEntriesByDates(
    timeEntries,
    windowRange?.workdayDates ?? [],
  );

  const weeklyProgress = buildWeeklyProjectProgress(
    projects,
    windowEntries,
    plannedDaysState,
  );

  const report = reportByDateAndProject(timeEntries, projects, tasks);
  const grandTotal = sumTimeEntryMinutes(timeEntries);
  const windowActualTotal = sumWeeklyActualMinutes(weeklyProgress);

  return (
    <div className="bg-card border border-border rounded-lg h-full min-h-0 overflow-hidden">
      <div className="gap-6 grid grid-cols-[3fr_2fr] p-4 h-full min-h-0">
        {/* LEFT — 60% */}
        <div className="flex flex-col gap-6 min-w-0 h-full min-h-0">
          {/* Range follow — 50% */}
          <div className="flex flex-col space-y-3 p-3 border rounded-lg h-1/2 min-h-0 overflow-hidden">
            <div className="font-medium text-sm shrink-0">
              Suivi sur plage de dates
            </div>

            <RangeSelector
              onWindowRangeChange={setWindowRange}
              windowActualTotal={windowActualTotal}
            />

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucun projet à afficher.
                </p>
              ) : (
                <WeeklyProjectList
                  weeklyProgress={weeklyProgress}
                  onPlannedDaysByProjectIdChange={setPlannedDaysState}
                />
              )}
            </div>
          </div>

          {/* Calendar — 50% */}
          <div className="flex flex-col space-y-3 h-1/2 min-h-0">
            <div className="font-medium text-sm shrink-0">Calendrier</div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WeeklyCalendarReport
                timeEntries={timeEntries}
                tasks={tasks}
                projects={projects}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — 40% */}
        <div className="flex flex-col space-y-4 min-w-0 h-full min-h-0">
          <div className="flex justify-between items-center shrink-0">
            <div className="font-medium text-sm">Récapitulatif quotidien</div>

            <div className="text-muted-foreground text-sm">
              Total général : <strong>{formatMinutes(grandTotal)}</strong>
            </div>
          </div>

          {/* Only this area scrolls */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <DailyReport report={report} />
          </div>
        </div>
      </div>
    </div>
  );
}
