import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  formatMinutes,
  isValidPlannedDaysInput,
  parsePlannedDaysByProject,
  type WeeklyProjectProgress,
} from "@/lib/time";

interface WeeklyProjectListProps {
  weeklyProgress: WeeklyProjectProgress[];
  onPlannedDaysByProjectIdChange: (plannedDays: Record<string, number>) => void;
}

export function WeeklyProjectList({
  weeklyProgress,
  onPlannedDaysByProjectIdChange,
}: WeeklyProjectListProps) {
  const [plannedDaysInputByProjectId, setPlannedDaysInputByProjectId] =
    useState<Record<string, string>>({});

  const handlePlannedDaysChange = (projectId: string, value: string) => {
    if (!isValidPlannedDaysInput(value)) return;

    setPlannedDaysInputByProjectId((prev) => {
      const next = { ...prev, [projectId]: value };
      onPlannedDaysByProjectIdChange(parsePlannedDaysByProject(next));
      return next;
    });
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full min-w-175 text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-3 py-2 text-left font-medium">Projet</th>
            <th className="px-3 py-2 text-left font-medium">Jours prevus</th>
            <th className="px-3 py-2 text-right font-medium">Realise</th>
            <th className="px-3 py-2 text-right font-medium">%</th>
            <th className="px-3 py-2 text-right font-medium">Depassement</th>
          </tr>
        </thead>
        <tbody>
          {weeklyProgress
            .filter((project) => project.actualMinutes > 0)
            .map((project) => (
              <tr key={project.projectId} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="rounded-full w-2.5 h-2.5 shrink-0"
                      style={{ backgroundColor: project.projectColor }}
                    />
                    <span className="truncate">{project.projectName}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={plannedDaysInputByProjectId[project.projectId] ?? ""}
                    onChange={(e) =>
                      handlePlannedDaysChange(project.projectId, e.target.value)
                    }
                    className="h-8 max-w-27.5"
                    aria-label={`Jours prevus pour ${project.projectName}`}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  {formatMinutes(project.actualMinutes)}
                </td>
                <td className="px-3 py-2 text-right">
                  {project.completionPercent.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right">
                  {project.overflowMinutes > 0
                    ? formatMinutes(project.overflowMinutes)
                    : "0min"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
