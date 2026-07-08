import { createStore, del, get, keys, set } from "idb-keyval";
import { type ExportPayload, exportData, importData } from "./import-export";

const SNAPSHOT_DB_NAME = "gestion-projet-snapshots";
const SNAPSHOT_STORE_NAME = "snapshots";
const snapshotStore = createStore(SNAPSHOT_DB_NAME, SNAPSHOT_STORE_NAME);

const SNAPSHOT_KEY_PREFIX = "snapshot:";
const DEFAULT_SNAPSHOT_RETENTION = 14;
const AUTO_BACKUP_INTERVAL_MS = 12 * 60 * 60 * 1000;
const AUTO_BACKUP_LAST_AT_KEY = "gp-auto-backup-last-at";
const AUTO_BACKUP_LAST_SIGNATURE_KEY = "gp-auto-backup-last-signature";

export interface SnapshotMetadata {
  id: string;
  createdAt: string;
  label?: string;
}

interface SnapshotRecord {
  meta: SnapshotMetadata;
  data: ExportPayload;
}

type AutoSnapshotResult = {
  created: boolean;
  snapshot?: SnapshotMetadata;
  reason: "created" | "interval-not-reached" | "no-change";
};

function getSnapshotKey(id: string) {
  return `${SNAPSHOT_KEY_PREFIX}${id}`;
}

function parseSnapshotRecord(value: unknown): SnapshotRecord | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<SnapshotRecord>;
  const meta = record.meta;

  if (!meta || typeof meta !== "object") return null;
  if (typeof meta.id !== "string") return null;
  if (typeof meta.createdAt !== "string") return null;

  if (!record.data || typeof record.data !== "object") return null;

  return {
    meta: {
      id: meta.id,
      createdAt: meta.createdAt,
      label: typeof meta.label === "string" ? meta.label : undefined,
    },
    data: record.data as ExportPayload,
  };
}

export async function createSnapshot(options: {
  label: string;
}): Promise<SnapshotMetadata> {
  const data = await exportData();
  return persistSnapshot(data, options.label);
}

function getDataSignature(data: ExportPayload): string {
  return JSON.stringify({
    version: data.version,
    state: data.state,
    assets: {
      markdownImages: data.assets.markdownImages.map((asset) => asset.id),
    },
  });
}

function getLastAutoBackupAt(): number | null {
  const raw = globalThis.localStorage.getItem(AUTO_BACKUP_LAST_AT_KEY);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function setLastAutoBackupState(atMs: number, signature: string) {
  globalThis.localStorage.setItem(AUTO_BACKUP_LAST_AT_KEY, String(atMs));
  globalThis.localStorage.setItem(AUTO_BACKUP_LAST_SIGNATURE_KEY, signature);
}

async function persistSnapshot(
  data: ExportPayload,
  label: string,
): Promise<SnapshotMetadata> {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID().toLowerCase();

  const meta: SnapshotMetadata = {
    id,
    createdAt,
    label,
  };

  await set(getSnapshotKey(id), { meta, data }, snapshotStore);
  await pruneSnapshots(DEFAULT_SNAPSHOT_RETENTION);

  return meta;
}

export async function createAutoSnapshotIfNeeded(): Promise<AutoSnapshotResult> {
  const nowMs = Date.now();
  const lastAutoBackupAt = getLastAutoBackupAt();

  if (
    typeof lastAutoBackupAt === "number" &&
    nowMs - lastAutoBackupAt < AUTO_BACKUP_INTERVAL_MS
  ) {
    console.log("[auto-backup] Interval not reached, skipping");
    return { created: false, reason: "interval-not-reached" };
  }

  const data = await exportData();
  const signature = getDataSignature(data);
  const lastSignature = globalThis.localStorage.getItem(
    AUTO_BACKUP_LAST_SIGNATURE_KEY,
  );

  if (lastSignature === signature) {
    console.log("[auto-backup] No changes detected, skipping");
    return { created: false, reason: "no-change" };
  }

  const snapshot = await persistSnapshot(data, "auto-12h");
  setLastAutoBackupState(nowMs, signature);

  return {
    created: true,
    snapshot,
    reason: "created",
  };
}

export async function listSnapshots(): Promise<SnapshotMetadata[]> {
  const storeKeys = await keys(snapshotStore);
  const snapshotKeys = storeKeys.flatMap((storeKey) => {
    if (typeof storeKey !== "string") return [];
    if (!storeKey.startsWith(SNAPSHOT_KEY_PREFIX)) return [];
    return [storeKey];
  });

  const records = await Promise.all(
    snapshotKeys.map((snapshotKey) => get(snapshotKey, snapshotStore)),
  );

  return records
    .flatMap((record) => {
      const parsedRecord = parseSnapshotRecord(record);
      return parsedRecord ? [parsedRecord.meta] : [];
    })
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function restoreSnapshot(id: string): Promise<void> {
  const raw = await get(getSnapshotKey(id), snapshotStore);
  const record = parseSnapshotRecord(raw);

  if (!record) {
    throw new Error(`Snapshot not found: ${id}`);
  }

  await importData(record.data as unknown as Record<string, unknown>);
}

export async function deleteSnapshot(id: string): Promise<void> {
  await del(getSnapshotKey(id), snapshotStore);
}

export async function pruneSnapshots(maxRetained: number): Promise<void> {
  const retained = Number.isFinite(maxRetained)
    ? Math.max(0, Math.floor(maxRetained))
    : DEFAULT_SNAPSHOT_RETENTION;

  const snapshots = await listSnapshots();
  if (snapshots.length <= retained) return;

  const obsolete = snapshots.slice(retained);
  await Promise.all(obsolete.map((snapshot) => deleteSnapshot(snapshot.id)));
}
