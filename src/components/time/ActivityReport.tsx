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
import { useAppStore } from "@/store";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function ActivityReport() {
  const [open, setOpen] = useState(false);
  const timeEntries = useAppStore((s) => s.timeEntries);
  const projects = useAppStore((s) => s.projects);

  const report = useMemo(() => {
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
  }, [timeEntries, projects]);

  const grandTotal = useMemo(
    () => timeEntries.reduce((sum, e) => sum + e.minutes, 0),
    [timeEntries],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span className="w-full" />}>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Rapport
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rapport d'activité</DialogTitle>
        </DialogHeader>

        {report.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucune entrée de temps enregistrée.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total général : <strong>{formatMinutes(grandTotal)}</strong>
            </div>

            <div className="space-y-3">
              {report.map(({ date, projects: dayProjects, total }) => (
                <div key={date} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {new Date(date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatMinutes(total)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayProjects.map((p) => (
                      <div
                        key={p.projectId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
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
