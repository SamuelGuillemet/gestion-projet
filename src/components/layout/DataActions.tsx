import { get, set } from "idb-keyval";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const STORE_KEYS = [
  "gp-projects",
  "gp-tasks",
  "gp-tags",
  "gp-notes",
  "gp-time",
  "gp-relations",
] as const;

export function DataActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const entries = await Promise.all(
      STORE_KEYS.map(async (key) => [key, await get(key)] as const),
    );
    const data = Object.fromEntries(entries.filter(([, v]) => v != null));
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gestion-projet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string);

        // Support legacy single-blob format
        if (data.state) {
          const state = data.state;
          const version = 2;
          await Promise.all([
            set("gp-projects", {
              state: {
                projects: state.projects ?? [],
                activeProjectId: state.activeProjectId ?? null,
              },
              version,
            }),
            set("gp-tasks", { state: { tasks: state.tasks ?? [] }, version }),
            set("gp-tags", { state: { tags: state.tags ?? [] }, version }),
            set("gp-notes", {
              state: {
                notes: state.notes ?? [],
                questions: state.questions ?? [],
                deliverables: state.deliverables ?? [],
              },
              version,
            }),
            set("gp-time", {
              state: {
                timeEntries: state.timeEntries ?? [],
                milestones: state.milestones ?? [],
              },
              version,
            }),
            set("gp-relations", {
              state: { relations: state.relations ?? [] },
              version,
            }),
          ]);
        } else {
          // New partitioned format
          await Promise.all(
            STORE_KEYS.filter((key) => data[key] != null).map((key) =>
              set(key, data[key]),
            ),
          );
        }

        window.location.reload();
      } catch {
        alert("Fichier invalide");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExport}
        title="Exporter les données"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        title="Importer des données"
      >
        <Upload className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
