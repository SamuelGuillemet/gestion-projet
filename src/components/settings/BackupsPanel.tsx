import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createSnapshot,
  deleteSnapshot,
  listSnapshots,
  restoreSnapshot,
  type SnapshotMetadata,
} from "@/store/snapshots";

const formatSnapshotDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function BackupsPanel() {
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);

  const refreshSnapshots = async () => {
    try {
      setSnapshots(await listSnapshots());
    } catch (e) {
      alert("Impossible de charger les snapshots");
      console.error(e);
    }
  };

  useEffect(() => {
    // react-doctor-disable-next-line react-hooks-js/set-state-in-effect -- initial fetch from IndexedDB, setState runs post-await
    // Initial synchronization with the external IndexedDB snapshot store.
    // oxlint-disable-next-line react/set-state-in-effect
    refreshSnapshots();
  }, []);

  const handleSnapshot = async () => {
    try {
      await createSnapshot({ label: "manual" });
      await refreshSnapshots();
    } catch (e) {
      alert("Impossible de créer le backup");
      console.error(e);
    }
  };

  const handleRestoreSnapshot = async (snapshot: SnapshotMetadata) => {
    try {
      await createSnapshot({ label: `pre-restore:${snapshot.id}` });
      await restoreSnapshot(snapshot.id);
      await refreshSnapshots();
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

  const recommendedSnapshot = snapshots[0] ?? null;

  return (
    <div className="mt-2 space-y-3">
      <p className="text-sm text-muted-foreground">
        Créez un snapshot, puis appliquez un backup pour revenir à un état précédent.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSnapshot}>
          <Archive className="h-4 w-4" />
          Créer un snapshot
        </Button>
        <Button variant="ghost" size="sm" onClick={() => refreshSnapshots()}>
          Rafraîchir
        </Button>
      </div>

      {recommendedSnapshot ? (
        <div className="rounded-md border bg-accent/45 p-3">
          <p className="text-sm font-medium">Backup recommandé</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Le plus récent: {formatSnapshotDate(recommendedSnapshot.createdAt)}
            {recommendedSnapshot.label ? ` (${recommendedSnapshot.label})` : ""}
          </p>
          <div className="mt-2">
            <ConfirmDialog
              triggerClassName="inline-flex"
              trigger={
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
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
        <p className="text-sm font-medium">Historique des snapshots</p>
        <div className="space-y-2">
          {snapshots?.map((snapshot) => (
            <div
              key={snapshot.id}
              className="flex flex-col gap-2 rounded-md border bg-card/65 p-2 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{formatSnapshotDate(snapshot.createdAt)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {snapshot.label ?? "sans libellé"}
                </p>
              </div>
              <ConfirmDialog
                triggerClassName="inline-flex"
                trigger={
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
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
                    <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
