import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { formatMinutes, reportByDateAndProject } from "@/lib/time";

export function ActivityReport() {
  const [open, setOpen] = useState(false);
  const timeEntries = useTimeEntries();
  const { projects } = useProjects();

  const report = useMemo(
    () => reportByDateAndProject(timeEntries, projects),
    [timeEntries, projects],
  );

  const grandTotal = useMemo(
    () => timeEntries.reduce((sum, e) => sum + e.minutes, 0),
    [timeEntries],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span className="w-full" />} nativeButton={false}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BarChart3 className="w-4 h-4" />
          Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapport d'activité</DialogTitle>
        </DialogHeader>

        {report.length === 0 ? (
          <p className="py-4 text-muted-foreground text-sm">
            Aucune entrée de temps enregistrée.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-muted-foreground text-sm">
              Total général : <strong>{formatMinutes(grandTotal)}</strong>
            </div>

            <div className="space-y-3">
              {report.map(({ date, projects: dayProjects, total }) => (
                <div key={date} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {new Date(date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="font-semibold text-muted-foreground text-xs">
                      {formatMinutes(total)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayProjects.map((p) => (
                      <div
                        key={p.projectId}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full w-2.5 h-2.5"
                            style={{ backgroundColor: p.projectColor }}
                          />
                          <span>{p.projectName}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatMinutes(p.minutes)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
