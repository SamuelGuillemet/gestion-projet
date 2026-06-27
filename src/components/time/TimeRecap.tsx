import { Check, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasksByProjectId } from "@/hooks/useTasks";
import {
  useTimeActions,
  useTimeEntriesByProjectId,
} from "@/hooks/useTimeTracking";
import { formatMinutes } from "@/lib/time";

interface TimeRecapProps {
  projectId: string;
}

export function TimeRecap({ projectId }: TimeRecapProps) {
  const timeEntries = useTimeEntriesByProjectId(projectId);
  const { updateTimeEntry, deleteTimeEntry } = useTimeActions();
  const tasks = useTasksByProjectId(projectId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

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

  const taskTotals = useMemo(
    () =>
      [...byTask.entries()].sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return (taskMap.get(a[0]) ?? "Tâche supprimée").localeCompare(
          taskMap.get(b[0]) ?? "Tâche supprimée",
        );
      }),
    [byTask, taskMap],
  );

  const startEdit = (id: string, date: string, minutes: number) => {
    setEditingId(id);
    setEditDate(date);
    setEditMinutes(String(minutes));
  };

  const saveEdit = () => {
    if (!editingId || !editDate || !editMinutes) return;

    const minutes = Number(editMinutes);
    if (!Number.isFinite(minutes) || minutes < 0) return;

    updateTimeEntry(editingId, { date: editDate, minutes });
    setEditingId(null);
  };

  return (
    <div className="p-4 rounded-md overflow-y-auto atelier-card no-scrollbar">
      <div className="flex flex-wrap justify-between items-end gap-2 mb-3">
        <h3 className="text-foreground atelier-section-title">Récapitulatif</h3>
        <div className="bg-background/75 px-2 py-1 border rounded font-data font-semibold text-sm">
          {formatMinutes(totalMinutes)}
        </div>
      </div>

      {byTask.size > 0 && (
        <div className="bg-background/70 mb-4 border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="p-2 font-data font-semibold text-[0.68rem] text-muted-foreground text-left uppercase tracking-widest">
                  Tâche
                </th>
                <th className="p-2 font-data font-semibold text-[0.68rem] text-muted-foreground text-right uppercase tracking-widest">
                  Temps
                </th>
              </tr>
            </thead>
            <tbody>
              {taskTotals.map(([tid, mins]) => (
                <tr key={tid} className="border-t">
                  <td className="p-2">
                    {taskMap.get(tid) ?? "Tâche supprimée"}
                  </td>
                  <td className="p-2 font-data text-right">
                    {formatMinutes(mins)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <span className="text-muted-foreground atelier-section-title">
            Entrées récentes
          </span>
          <div className="bg-background/65 border rounded-md">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-36" />
                <col />
                <col className="w-24" />
                <col className="w-18" />
              </colgroup>
              <tbody>
                {timeEntries
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      className="group hover:bg-accent/45 border-b"
                    >
                      {editingId === entry.id ? (
                        <>
                          <td className="p-1.5 align-middle">
                            <Input
                              type="date"
                              value={editDate}
                              onChange={(event) =>
                                setEditDate(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") saveEdit();
                                if (event.key === "Escape") setEditingId(null);
                              }}
                              className="w-full h-7 text-xs"
                            />
                          </td>
                          <td className="p-1.5 align-middle">
                            <span className="block truncate">
                              {taskMap.get(entry.taskId) ?? "?"}
                            </span>
                          </td>
                          <td className="p-1.5 align-middle">
                            <Input
                              type="number"
                              min={0}
                              value={editMinutes}
                              onChange={(event) =>
                                setEditMinutes(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") saveEdit();
                                if (event.key === "Escape") setEditingId(null);
                              }}
                              className="w-full h-7 text-xs"
                              autoFocus
                            />
                          </td>
                          <td className="p-1.5 align-middle">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-7 h-7 shrink-0"
                                onClick={saveEdit}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-7 h-7 shrink-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-1.5 font-data text-muted-foreground align-middle">
                            {entry.date}
                          </td>
                          <td className="p-1.5 align-middle">
                            <span className="block truncate">
                              {taskMap.get(entry.taskId) ?? "?"}
                            </span>
                          </td>
                          <td className="p-1.5 font-data font-semibold text-right align-middle">
                            {formatMinutes(entry.minutes)}
                          </td>
                          <td className="p-1.5 align-middle">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity"
                                onClick={() =>
                                  startEdit(entry.id, entry.date, entry.minutes)
                                }
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 text-destructive transition-opacity"
                                onClick={() => deleteTimeEntry(entry.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
