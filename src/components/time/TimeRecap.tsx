import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useTimeActions } from "@/hooks/useTimeTracking";
import { formatMinutes } from "@/lib/time";
import { useTaskStore, useTimeStore } from "@/store";

interface TimeRecapProps {
  projectId: string;
}

export function TimeRecap({ projectId }: TimeRecapProps) {
  const timeEntries = useTimeStore(
    useShallow((s) => s.timeEntries.filter((e) => e.projectId === projectId)),
  );
  const { deleteTimeEntry } = useTimeActions();
  const tasks = useTaskStore(
    useShallow((s) => s.tasks.filter((t) => t.projectId === projectId)),
  );

  const totalMinutes = useMemo(
    () => timeEntries.reduce((sum, e) => sum + e.minutes, 0),
    [timeEntries],
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tasks) map.set(t.id, t.title);
    return map;
  }, [tasks]);

  const byTask = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of timeEntries) {
      map.set(entry.taskId, (map.get(entry.taskId) ?? 0) + entry.minutes);
    }
    return map;
  }, [timeEntries]);

  return (
    <div>
      <h3 className="mb-3 font-medium text-sm">
        Récapitulatif - Total : {formatMinutes(totalMinutes)}
      </h3>

      {byTask.size > 0 && (
        <div className="mb-4 border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 font-medium text-left">Tâche</th>
                <th className="p-2 font-medium text-right">Temps</th>
              </tr>
            </thead>
            <tbody>
              {[...byTask.entries()].map(([tid, mins]) => (
                <tr key={tid} className="border-t">
                  <td className="p-2">
                    {taskMap.get(tid) ?? "Tâche supprimée"}
                  </td>
                  <td className="p-2 text-right">{formatMinutes(mins)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-1">
          <span className="text-muted-foreground text-xs">
            Entrées récentes
          </span>
          {timeEntries
            .slice()
            .reverse()
            .slice(0, 10)
            .map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center gap-2 text-xs"
              >
                <span className="w-20 text-muted-foreground">{entry.date}</span>
                <span className="flex-1">
                  {taskMap.get(entry.taskId) ?? "?"}
                </span>
                <span className="font-medium">
                  {formatMinutes(entry.minutes)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 w-5 h-5"
                  onClick={() => deleteTimeEntry(entry.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
