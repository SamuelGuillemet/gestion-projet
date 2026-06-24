import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjects } from "@/hooks/useProjects";
import { useTimeEntries } from "@/hooks/useTimeTracking";
import {
  buildWeeklyProjectProgress,
  filterTimeEntriesByDates,
  formatMinutes,
  reportByDateAndProject,
  sumTimeEntryMinutes,
  sumWeeklyActualMinutes,
  type WorkdayRange,
} from "@/lib/time";
import { DailyReport } from "./DailyReport";
import { RangeSelector } from "./RangeSelector";
import { WeeklyProjectList } from "./WeeklyProjectList";

export function ActivityReport() {
  const [open, setOpen] = useState(false);
  const [windowRange, setWindowRange] = useState<WorkdayRange | null>(null);
  const [plannedDaysState, setPlannedDaysState] = useState<
    Record<string, number>
  >({});

  const timeEntries = useTimeEntries();
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

  const report = reportByDateAndProject(timeEntries, projects);

  const grandTotal = sumTimeEntryMinutes(timeEntries);

  const windowActualTotal = sumWeeklyActualMinutes(weeklyProgress);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span className="w-full" />} nativeButton={false}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BarChart3 className="w-4 h-4" />
          Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapport d'activité</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="font-medium text-sm">Suivi sur plage de dates</div>
            <RangeSelector
              onWindowRangeChange={setWindowRange}
              windowActualTotal={windowActualTotal}
            />

            {projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun projet a afficher.
              </p>
            ) : (
              <WeeklyProjectList
                weeklyProgress={weeklyProgress}
                onPlannedDaysByProjectIdChange={setPlannedDaysState}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">
              Total général : <strong>{formatMinutes(grandTotal)}</strong>
            </div>

            <DailyReport report={report} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
