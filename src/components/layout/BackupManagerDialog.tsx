import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createAutoSnapshotIfNeeded,
  createSnapshot,
  deleteSnapshot,
  listSnapshots,
  restoreSnapshot,
  type SnapshotMetadata,
} from "@/store/snapshots";

export function BackupManagerDialog() {
  const [open, setOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);

  useEffect(() => {
    const runAutoBackup = async () => {
      try {
        await createAutoSnapshotIfNeeded();
      } catch (e) {
        console.error("[auto-backup] Failed", e);
      }
    };

    runAutoBackup();

    const intervalId = globalThis.setInterval(
      () => {
        runAutoBackup();
      },
      60 * 60 * 1000,
    );

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, []);

  const refreshSnapshots = async () => {
    setIsSnapshotLoading(true);
    try {
      setSnapshots(await listSnapshots());
    } catch (e) {
      alert("Impossible de charger les snapshots");
      console.error(e);
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    refreshSnapshots();
  }, [open]);

  const handleSnapshot = async () => {
    try {
      await createSnapshot({ label: "manual" });
      await refreshSnapshots();
    } catch (e) {
      alert("Impossible de créer le snapshot");
      console.error(e);
    }
  };

  const handleRestoreSnapshot = async (snapshot: SnapshotMetadata) => {
    try {
      await createSnapshot({ label: `pre-restore:${snapshot.id}` });
      await restoreSnapshot(snapshot.id);
      globalThis.location.reload();
    } catch (e) {
      alert("Impossible d'appliquer ce backup");
      console.error(e);
    }
  };

  const handleDeleteSnapshot = async (snapshot: SnapshotMetadata) => {
    try {
      await deleteSnapshot(snapshot.id);
      await refreshSnapshots();
    } catch (e) {
      alert("Impossible de supprimer ce backup");
      console.error(e);
    }
  };

  const formatSnapshotDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const recommendedSnapshot = snapshots[0] ?? null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />} nativeButton={false}>
        <Button variant="outline" size="sm" title="Gérer les backups">
          <Archive className="w-4 h-4" />
          <span className="hidden 2xl:inline">Backups</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[82vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backups locaux</DialogTitle>
          <DialogDescription>
            Créez un snapshot, puis appliquez un backup pour revenir à un état
            précédent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSnapshot}>
              <Archive className="w-4 h-4" />
              Créer un snapshot
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshSnapshots()}
              disabled={isSnapshotLoading}
            >
              Rafraîchir
            </Button>
          </div>

          {recommendedSnapshot ? (
            <div className="bg-accent/45 p-3 border rounded-md">
              <p className="font-medium text-sm">Backup recommandé</p>
              <p className="mt-1 text-muted-foreground text-xs">
                Le plus récent:{" "}
                {formatSnapshotDate(recommendedSnapshot.createdAt)}
                {recommendedSnapshot.label
                  ? ` (${recommendedSnapshot.label})`
                  : ""}
              </p>
              <div className="mt-2">
                <ConfirmDialog
                  triggerClassName="inline-flex"
                  trigger={
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                      Appliquer ce backup
                    </Button>
                  }
                  title="Appliquer un backup"
                  description="L'état actuel sera remplacé. Un snapshot de sécurité sera créé juste avant la restauration."
                  confirmLabel="Appliquer"
                  onConfirm={() => {
                    handleRestoreSnapshot(recommendedSnapshot);
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="font-medium text-sm">Historique des snapshots</p>
            {isSnapshotLoading ? (
              <p className="text-muted-foreground text-xs">Chargement...</p>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex sm:flex-row flex-col sm:items-center gap-2 bg-card/65 p-2 border rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">
                        {formatSnapshotDate(snapshot.createdAt)}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        {snapshot.label ?? "sans libellé"}
                      </p>
                    </div>
                    <ConfirmDialog
                      triggerClassName="inline-flex"
                      trigger={
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4" />
                          Appliquer
                        </Button>
                      }
                      title="Appliquer un backup"
                      description="L'état actuel sera remplacé. Un snapshot de sécurité sera créé juste avant la restauration."
                      confirmLabel="Appliquer"
                      onConfirm={() => {
                        handleRestoreSnapshot(snapshot);
                      }}
                    />
                    <ConfirmDialog
                      triggerClassName="inline-flex"
                      trigger={
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </Button>
                      }
                      title="Supprimer ce backup"
                      description="Cette action est irréversible. Le backup sélectionné sera définitivement supprimé."
                      confirmLabel="Supprimer"
                      onConfirm={() => {
                        handleDeleteSnapshot(snapshot);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
