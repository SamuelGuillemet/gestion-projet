import {
  formatLongDateLabel,
  formatMinutes,
  type reportByDateAndProject,
} from "@/lib/time";

interface DailyReportProps {
  report: ReturnType<typeof reportByDateAndProject>;
}

export function DailyReport({ report }: DailyReportProps) {
  if (report.length === 0) {
    return (
      <p className="py-2 text-muted-foreground text-sm">
        Aucune entree de temps enregistree.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {report.map(({ date, projects: dayProjects, total }) => (
        <div key={date} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm">
              {formatLongDateLabel(date)}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {formatMinutes(total)}
            </span>
          </div>
          <div className="space-y-1">
            {dayProjects.map((project) => (
              <div
                key={project.projectId}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full w-2.5 h-2.5"
                    style={{ backgroundColor: project.projectColor }}
                  />
                  <span>{project.projectName}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatMinutes(project.minutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
