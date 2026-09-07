import { Eye } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatLongDateLabel, formatMinutes, type reportByDateAndProject } from "@/lib/time";

interface DailyReportProps {
  report: ReturnType<typeof reportByDateAndProject>;
}

export function DailyReport({ report }: DailyReportProps) {
  if (report.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">Aucune entree de temps enregistree.</p>
    );
  }

  return (
    <div className="space-y-3">
      {report.map(({ date, projects: dayProjects, total }) => (
        <div key={date} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{formatLongDateLabel(date)}</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {formatMinutes(total)}
            </span>
          </div>
          <div className="space-y-1">
            {dayProjects.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.projectColor }}
                  />
                  <span>{project.projectName}</span>
                  {project.tasksBreakdown.length > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger
                        render={
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:text-foreground"
                            aria-label={`Voir le detail des taches pour ${project.projectName}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        }
                      />
                      <HoverCardContent side="right" align="center" className="w-64 p-2 text-xs">
                        <table className="w-full border-collapse">
                          <tbody>
                            {project.tasksBreakdown.map((task) => (
                              <tr key={task.taskId} className="align-top">
                                <td className="py-0.5 pr-2 whitespace-nowrap text-muted-foreground">
                                  {`#${task.taskNumber}`}
                                </td>
                                <td className="py-0.5 pr-2">
                                  <span className="line-clamp-1">{task.taskTitle}</span>
                                </td>
                                <td className="py-0.5 text-right whitespace-nowrap text-muted-foreground">
                                  {formatMinutes(task.minutes)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </HoverCardContent>
                    </HoverCard>
                  ) : null}
                </div>
                <span className="text-muted-foreground">{formatMinutes(project.minutes)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
