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
    <div className="space-y-3 mt-2">
      <p className="text-muted-foreground text-sm">
        Créez un snapshot, puis appliquez un backup pour revenir à un état
        précédent.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSnapshot}>
          <Archive className="w-4 h-4" />
          Créer un snapshot
        </Button>
        <Button variant="ghost" size="sm" onClick={() => refreshSnapshots()}>
          Rafraîchir
        </Button>
      </div>

      {recommendedSnapshot ? (
        <div className="bg-accent/45 p-3 border rounded-md">
          <p className="font-medium text-sm">Backup recommandé</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Le plus récent: {formatSnapshotDate(recommendedSnapshot.createdAt)}
            {recommendedSnapshot.label ? ` (${recommendedSnapshot.label})` : ""}
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
        <div className="space-y-2">
          {snapshots?.map((snapshot) => (
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
      </div>
    </div>
  );
}
