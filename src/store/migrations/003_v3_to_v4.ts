import { get, set } from "idb-keyval";

export const version = 4;

type StoreState = Record<string, unknown>;
type StoreValue = { state?: StoreState; version?: number };

const ENTITY_STORES = [
  ["gp-tasks", "tasks"],
  ["gp-questions", "questions"],
  ["gp-deliverables", "deliverables"],
  ["gp-notes", "notes"],
] as const;

function getProjectKey(item: Record<string, unknown>) {
  return typeof item.projectId === "string" ? item.projectId : "__unknown__";
}

function addNumbers(items: unknown[]) {
  const nextByProject = new Map<string, number>();

  return items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;

    const entity = item as Record<string, unknown>;
    const projectKey = getProjectKey(entity);
    const currentNumber = entity.number;

    if (typeof currentNumber === "number" && Number.isInteger(currentNumber)) {
      nextByProject.set(
        projectKey,
        Math.max(nextByProject.get(projectKey) ?? 1, currentNumber + 1),
      );
      return entity;
    }

    const number = nextByProject.get(projectKey) ?? 1;
    nextByProject.set(projectKey, number + 1);

    return { ...entity, number };
  });
}

async function migrateStore(storeName: string, collectionKey: string) {
  const store = (await get(storeName)) as StoreValue | undefined;
  const state = store?.state;
  const collection = state?.[collectionKey];

  if (!Array.isArray(collection)) {
    await set(storeName, { ...store, version });
    return false;
  }

  await set(storeName, {
    ...store,
    version,
    state: {
      ...state,
      [collectionKey]: addNumbers(collection),
    },
  });
  return true;
}

export async function run(): Promise<boolean> {
  try {
    const writes = await Promise.all(
      ENTITY_STORES.map(([storeName, collectionKey]) =>
        migrateStore(storeName, collectionKey),
      ),
    );
    return writes.some(Boolean);
  } catch (e) {
    console.error("[migration v3->v4] Failed:", e);
    return false;
  }
}

export function transform(
  state: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...state };

  for (const [storeName, collectionKey] of ENTITY_STORES) {
    const storeState = next[storeName];
    if (!storeState || typeof storeState !== "object") continue;

    const collection = (storeState as StoreState)[collectionKey];
    if (!Array.isArray(collection)) continue;

    next[storeName] = {
      ...(storeState as StoreState),
      [collectionKey]: addNumbers(collection),
    };
  }

  return next;
}
