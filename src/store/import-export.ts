import { get, set } from "idb-keyval";
import {
  IDB_STORES_NAMES,
  type IdbStoresName,
  STORE_VERSION,
} from "./constants";
import {
  transform as v1Transform,
  version as v1Version,
} from "./migrations/001_v1_to_v2";
import {
  transform as v2Transform,
  version as v2Version,
} from "./migrations/002_v2_to_v3";

type Transformations = {
  version: number;
  transform: (record: Record<string, unknown>) => Record<string, unknown>;
};

const TRANSFORMATIONS: Transformations[] = [
  { version: v1Version, transform: v1Transform },
  { version: v2Version, transform: v2Transform },
];

export async function exportData() {
  const entries = await Promise.all(
    IDB_STORES_NAMES.map(
      async (storeName) => [storeName, (await get(storeName)).state] as const,
    ),
  );
  return {
    version: STORE_VERSION,
    state: Object.fromEntries(entries),
  } as const;
}

export async function importData(data: Record<string, unknown>) {
  const version = data.version;
  if (!version || typeof version !== "number") {
    throw new Error("Invalid data: missing or invalid version");
  }

  let state = data.state as Record<string, unknown>;
  if (!state || typeof state !== "object") {
    throw new Error("Invalid data: missing or invalid state");
  }

  const sorted = TRANSFORMATIONS.slice().sort((a, b) => a.version - b.version);

  for (const t of sorted) {
    if (t.version > STORE_VERSION) {
      break;
    }
    state = t.transform(state);
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
}
