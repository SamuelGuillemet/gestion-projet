import { get, set } from "idb-keyval";

export const migrateVersion = async (storeName: string, version: number) =>
  await set(storeName, { ...(await get(storeName)), version });
