import { run as v1Run, version as v1Version } from "./001_v1_to_v2";
import { run as v2Run, version as v2Version } from "./002_v2_to_v3";
import { run as v3Run, version as v3Version } from "./003_v3_to_v4";

type Migration = { version: number; run: () => Promise<boolean> };

const STORE_VERSION_KEY = "store-version";

const MIGRATIONS: Migration[] = [
  { version: v1Version, run: v1Run },
  { version: v2Version, run: v2Run },
  { version: v3Version, run: v3Run },
];

const LEGACY_FLAG = "gp-migration-done";

export async function runMigrations(): Promise<void> {
  const raw = localStorage.getItem(STORE_VERSION_KEY);
  const legcayFlag = localStorage.getItem(LEGACY_FLAG);

  let current: number;
  if (raw) {
    current = Number.parseInt(raw, 10) || 1;
  } else if (legcayFlag) {
    current = 2;
  } else {
    current = 1;
  }

  if (!raw) localStorage.setItem(STORE_VERSION_KEY, String(current));

  let performedAnyWrites = false;

  const sorted = MIGRATIONS.slice().sort((a, b) => a.version - b.version);

  for (const m of sorted) {
    if (m.version <= current) {
      console.debug("[migrations] skipping", m.version, "already applied");
      continue;
    }
    try {
      const didWrite = await m.run();
      // advance version even if nothing to do, to mark migration applied
      localStorage.setItem(STORE_VERSION_KEY, String(m.version));
      current = m.version;
      performedAnyWrites = performedAnyWrites || !!didWrite;
    } catch (e) {
      console.error("[migrations] failed running", m.version, e);
      break;
    }
  }

  if (performedAnyWrites) {
    // Reload so stores rehydrate from the freshly-written IDB state
    globalThis.location.reload();
  }
}
