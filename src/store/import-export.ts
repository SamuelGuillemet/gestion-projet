import { get, set } from "idb-keyval";
import {
  IDB_STORES_NAMES,
  type IdbStoresName,
  STORE_VERSION,
} from "./constants";
import {
  type ExportedMarkdownImageAsset,
  exportMarkdownImageAssets,
  importMarkdownImageAssets,
} from "./markdown-image.store";
import {
  transform as v1Transform,
  version as v1Version,
} from "./migrations/001_v1_to_v2";
import {
  transform as v2Transform,
  version as v2Version,
} from "./migrations/002_v2_to_v3";
import {
  transform as v3Transform,
  version as v3Version,
} from "./migrations/003_v3_to_v4";

export interface ExportPayload {
  version: number;
  state: { [k: string]: unknown };
  assets: {
    markdownImages: ExportedMarkdownImageAsset[];
  };
}

type Transformations = {
  version: number;
  transform: (record: Record<string, unknown>) => Record<string, unknown>;
};

const TRANSFORMATIONS: Transformations[] = [
  { version: v1Version, transform: v1Transform },
  { version: v2Version, transform: v2Transform },
  { version: v3Version, transform: v3Transform },
];

function parseImportedMarkdownImageAssets(data: Record<string, unknown>) {
  const assetsRaw = data.assets;
  if (!assetsRaw || typeof assetsRaw !== "object") return [];

  const markdownImagesRaw =
    (assetsRaw as { markdownImages?: unknown }).markdownImages ?? [];
  if (!Array.isArray(markdownImagesRaw)) return [];

  return markdownImagesRaw.flatMap((asset): ExportedMarkdownImageAsset[] => {
    if (!asset || typeof asset !== "object") return [];

    const { id, mimeType, base64 } = asset;

    if (
      typeof id !== "string" ||
      typeof mimeType !== "string" ||
      typeof base64 !== "string"
    ) {
      return [];
    }

    return [{ id, mimeType, base64 }];
  });
}

export async function exportData(): Promise<ExportPayload> {
  const entries = await Promise.all(
    IDB_STORES_NAMES.map(
      async (storeName) => [storeName, (await get(storeName)).state] as const,
    ),
  );
  const markdownImageAssets = await exportMarkdownImageAssets();

  return {
    version: STORE_VERSION,
    state: Object.fromEntries(entries),
    assets: {
      markdownImages: markdownImageAssets,
    },
  };
}

export async function importData(data: Record<string, unknown>) {
  const importedVersion = data.version;
  if (!importedVersion || typeof importedVersion !== "number") {
    throw new Error("Invalid data: missing or invalid version");
  }
  if (importedVersion > STORE_VERSION) {
    throw new Error(`Unsupported data version: ${importedVersion}`);
  }

  let state = data.state as Record<string, unknown>;
  if (!state || typeof state !== "object") {
    throw new Error("Invalid data: missing or invalid state");
  }

  const migrationsToApply = TRANSFORMATIONS.toSorted(
    (a, b) => a.version - b.version,
  ).filter(
    ({ version }) => version > importedVersion && version <= STORE_VERSION,
  );

  for (const migration of migrationsToApply) {
    state = migration.transform(state);
  }

  const entries = Object.entries(state) as [IdbStoresName, unknown][];

  await Promise.all(
    entries.map(async ([storeName, value]) => {
      if (!IDB_STORES_NAMES.includes(storeName)) {
        throw new Error(`Invalid data: unknown store key "${storeName}"`);
      }
      await set(storeName, {
        version: STORE_VERSION,
        state: value,
      });
    }),
  );

  const markdownImageAssets = parseImportedMarkdownImageAssets(data);
  if (markdownImageAssets.length > 0) {
    await importMarkdownImageAssets(markdownImageAssets);
  }
}
