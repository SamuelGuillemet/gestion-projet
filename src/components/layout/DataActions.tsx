import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { BackupManagerDialog } from "@/components/layout/BackupManagerDialog";
import { Button } from "@/components/ui/button";
import { exportData, importData } from "@/store/import-export";
import { createSnapshot } from "@/store/snapshots";

const handleExport = async () => {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gestion-projet-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const fileInput = e.currentTarget;
  const file = fileInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsedRaw: unknown = JSON.parse(text);
    if (typeof parsedRaw !== "object" || parsedRaw === null) {
      alert("Fichier invalide");
      fileInput.value = "";
      return;
    }

    const parsed = parsedRaw as Record<string, unknown>;
    await createSnapshot({ label: "pre-import" });
    await importData(parsed);
    fileInput.value = "";
    globalThis.location.reload();
  } catch (e) {
    alert("Fichier invalide");
    console.error(e);
    fileInput.value = "";
  }
};

export function DataActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        title="Exporter les données"
      >
        <Download className="w-4 h-4" />
        <span className="hidden 2xl:inline">Exporter</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        title="Importer des données"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden 2xl:inline">Importer</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <BackupManagerDialog />
    </div>
  );
}
