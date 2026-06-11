import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useTimeActions } from "@/hooks/useTimeTracking";
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

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m}min`;
  };

  return (
    <div>
      <h3 className="font-medium text-sm mb-3">
        Récapitulatif — Total : {formatTime(totalMinutes)}
      </h3>

      {byTask.size > 0 && (
        <div className="border rounded-md overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Tâche</th>
                <th className="text-right p-2 font-medium">Temps</th>
              </tr>
            </thead>
            <tbody>
              {[...byTask.entries()].map(([tid, mins]) => (
                <tr key={tid} className="border-t">
                  <td className="p-2">
                    {taskMap.get(tid) ?? "Tâche supprimée"}
                  </td>
                  <td className="p-2 text-right">{formatTime(mins)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">
            Entrées récentes
          </span>
          {timeEntries
            .slice()
            .reverse()
            .slice(0, 10)
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 text-xs group"
              >
                <span className="text-muted-foreground w-20">{entry.date}</span>
                <span className="flex-1">
                  {taskMap.get(entry.taskId) ?? "?"}
                </span>
                <span className="font-medium">{formatTime(entry.minutes)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteTimeEntry(entry.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
