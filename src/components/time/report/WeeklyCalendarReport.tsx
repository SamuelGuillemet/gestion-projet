import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addDaysToDate,
  buildDailyTaskEntries,
  type DailyTaskEntry,
  formatMinutes,
  formatWeekRangeLabel,
  getWeekDates,
  getWeekStartDate,
  toIsoDateInput,
} from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Project } from "@/models/project";
import type { Task } from "@/models/task";
import type { TimeEntry } from "@/models/time-entry";

const PX_PER_HOUR = 32;
const MIN_BLOCK_HEIGHT = 6;
const MIN_HEIGHT_FOR_LABEL = 16;
const BASELINE_HOURS = 8;
const HOUR_SCALE_WIDTH = "1.5rem";

interface WeeklyCalendarReportProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  projects: Project[];
}

export function WeeklyCalendarReport({
  timeEntries,
  tasks,
  projects,
}: WeeklyCalendarReportProps) {
  const [weekStart, setWeekStart] = useState(() =>
    getWeekStartDate(new Date()),
  );

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const dailyEntries = useMemo(
    () => buildDailyTaskEntries(timeEntries, tasks, projects),
    [timeEntries, tasks, projects],
  );

  const todayKey = toIsoDateInput(new Date());
  const dayTotalsByDate = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const date of weekDates) {
      totals[date] = (dailyEntries[date] ?? []).reduce(
        (sum, entry) => sum + entry.minutes,
        0,
      );
    }
    return totals;
  }, [weekDates, dailyEntries]);

  const weekTotal = Object.values(dayTotalsByDate).reduce(
    (sum, minutes) => sum + minutes,
    0,
  );
  const maxDayMinutes = Math.max(0, ...Object.values(dayTotalsByDate));
  const maxHours = Math.max(BASELINE_HOURS, Math.ceil(maxDayMinutes / 60));
  const chartHeight = maxHours * PX_PER_HOUR;
  const hourMarks = Array.from({ length: maxHours + 1 }, (_, index) => index);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setWeekStart((prev) => addDaysToDate(prev, -7))}
            aria-label="Semaine precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setWeekStart((prev) => addDaysToDate(prev, 7))}
            aria-label="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(getWeekStartDate(new Date()))}
          >
            Cette semaine
          </Button>
        </div>
        <div className="text-muted-foreground text-xs">
          {formatWeekRangeLabel(weekDates)} ·{" "}
          <strong>{formatMinutes(weekTotal)}</strong>
        </div>
      </div>

      <div
        className="gap-2 grid grid-cols-7"
        style={{ paddingLeft: HOUR_SCALE_WIDTH }}
      >
        {weekDates.map((date) => (
          <div
            key={date}
            className="flex flex-col items-center gap-0.5 text-xs"
          >
            <span className="text-muted-foreground uppercase">
              {formatWeekdayShort(date)}
            </span>
            <span
              className={cn(
                "flex justify-center items-center rounded-full w-6 h-6",
                date === todayKey
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "font-medium",
              )}
            >
              {new Date(`${date}T00:00:00`).getDate()}
            </span>
          </div>
        ))}
      </div>

      <div className="relative" style={{ height: chartHeight }}>
        {hourMarks.map((hour) => {
          const isBaseline = hour === BASELINE_HOURS;
          return (
            <div
              key={hour}
              className="absolute inset-x-0 flex"
              style={{ bottom: hour * PX_PER_HOUR }}
            >
              <span
                className="text-[0.6rem] text-muted-foreground text-center"
                style={{ width: HOUR_SCALE_WIDTH }}
              >
                {hour}h
              </span>
              <div
                className={cn(
                  "flex-1 border-b",
                  isBaseline
                    ? "border-foreground/30"
                    : "border-dashed border-muted-foreground/20",
                )}
              />
            </div>
          );
        })}

        <div
          className="gap-2 grid grid-cols-7 h-full"
          style={{ paddingLeft: HOUR_SCALE_WIDTH }}
        >
          {weekDates.map((date) => (
            <div key={date} className="flex flex-col-reverse h-full">
              {(dailyEntries[date] ?? []).map((entry) => (
                <DayTaskBlock key={entry.taskId} entry={entry} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className="gap-2 grid grid-cols-7"
        style={{ paddingLeft: HOUR_SCALE_WIDTH }}
      >
        {weekDates.map((date) => (
          <div
            key={date}
            className="text-[0.65rem] text-muted-foreground text-center"
          >
            {dayTotalsByDate[date] > 0
              ? formatMinutes(dayTotalsByDate[date])
              : "—"}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayTaskBlock({ entry }: { entry: DailyTaskEntry }) {
  const height = Math.max(
    MIN_BLOCK_HEIGHT,
    Math.round((entry.minutes / 60) * PX_PER_HOUR),
  );
  const showLabel = height >= MIN_HEIGHT_FOR_LABEL;

  return (
    <div
      title={`#${entry.taskNumber} ${entry.taskTitle} — ${formatMinutes(entry.minutes)}`}
      className="flex items-center px-1 border-l-2 rounded-sm overflow-hidden text-[0.65rem] leading-tight"
      style={{
        height,
        backgroundColor: `${entry.projectColor}50`,
        borderLeftColor: entry.projectColor,
      }}
    >
      {showLabel ? (
        <span className="line-clamp-1">
          #{entry.taskNumber} {entry.taskTitle}
        </span>
      ) : null}
    </div>
  );
}

function formatWeekdayShort(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
  });
}
