import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useTasksByProjectId } from "@/hooks/useTasks";
import { useTimeActions, useTimeEntriesByProjectId } from "@/hooks/useTimeTracking";
import { formatMinutes } from "@/lib/time";

function getByTaskMap(timeEntries: { taskId: string; minutes: number }[]) {
  const map = new Map<string, number>();
  for (const entry of timeEntries) {
    map.set(entry.taskId, (map.get(entry.taskId) ?? 0) + entry.minutes);
  }
  return map;
}

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

  const totalMinutes = timeEntries.reduce((sum, e) => sum + e.minutes, 0);

  const taskMap = new Map(tasks.map((t) => [t.id, t.title]));

  const byTask = getByTaskMap(timeEntries);

  const taskTotals = [...byTask.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const aLabel = taskMap.get(a[0]) ?? "Tâche supprimée";
    const bLabel = taskMap.get(b[0]) ?? "Tâche supprimée";
    return aLabel.localeCompare(bLabel);
  });

  const startEdit = (id: string, date: string, minutes: number) => {
    setEditingId(id);
    setEditDate(date);
    setEditMinutes(String(minutes));
  };

  const saveEdit = () => {
    if (!editingId || !editDate || !editMinutes) return;

    const minutes = Number(editMinutes);

    updateTimeEntry(editingId, { date: editDate, minutes });
    setEditingId(null);
  };

  return (
    <div className="atelier-card no-scrollbar overflow-y-auto rounded-md p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h3 className="atelier-section-title text-foreground">Récapitulatif</h3>
        <div className="font-data rounded border bg-background/75 px-2 py-1 text-sm font-semibold">
          {formatMinutes(totalMinutes)}
        </div>
      </div>

      {byTask.size > 0 && (
        <div className="mb-4 overflow-hidden rounded-md border bg-background/70">
          <table className="w-full text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="font-data p-2 text-left text-2xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Tâche
                </th>
                <th className="font-data p-2 text-right text-2xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Temps
                </th>
              </tr>
            </thead>
            <tbody>
              {taskTotals.map(([tid, mins]) => (
                <tr key={tid} className="border-t">
                  <td className="p-2">{taskMap.get(tid) ?? "Tâche supprimée"}</td>
                  <td className="font-data p-2 text-right">{formatMinutes(mins)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <span className="atelier-section-title text-muted-foreground">Entrées récentes</span>
          <div className="rounded-md border bg-background/65">
            <table className="w-full table-fixed text-xs">
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
                    <tr key={entry.id} className="group border-b hover:bg-accent/45">
                      {editingId === entry.id ? (
                        <>
                          <td className="p-1.5 align-middle">
                            <Input
                              type="date"
                              value={editDate}
                              onChange={(event) => setEditDate(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") saveEdit();
                                if (event.key === "Escape") setEditingId(null);
                              }}
                              className="h-7 w-full text-xs"
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
                              onChange={(event) => setEditMinutes(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") saveEdit();
                                if (event.key === "Escape") setEditingId(null);
                              }}
                              className="h-7 w-full text-xs"
                              autoFocus
                            />
                          </td>
                          <td className="p-1.5 align-middle" aria-label="Actions">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={saveEdit}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="font-data p-1.5 align-middle text-muted-foreground">
                            {entry.date}
                          </td>
                          <td className="p-1.5 align-middle">
                            <span className="block truncate">
                              {taskMap.get(entry.taskId) ?? "?"}
                            </span>
                          </td>
                          <td className="font-data p-1.5 text-right align-middle font-semibold">
                            {formatMinutes(entry.minutes)}
                          </td>
                          <td className="p-1.5 align-middle">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => startEdit(entry.id, entry.date, entry.minutes)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <ConfirmDialog
                                triggerClassName="inline-flex"
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                }
                                title="Supprimer l'entrée"
                                description="Cette action est irréversible. L'entrée de temps sera définitivement supprimée."
                                onConfirm={() => deleteTimeEntry(entry.id)}
                              />
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
