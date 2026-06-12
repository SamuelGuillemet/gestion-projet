const LAST_NOTE_KEY = "gestion-projet-last-note";

export function getLastNoteId(projectId: string | null): string | null {
  if (!projectId) return null;
  try {
    const stored = localStorage.getItem(LAST_NOTE_KEY);
    if (stored) {
      const map = JSON.parse(stored);
      return map[projectId] ?? null;
    }
  } catch {}
  return null;
}

export function setLastNoteId(projectId: string | null, noteId: string | null) {
  if (!projectId) return;
  try {
    const stored = localStorage.getItem(LAST_NOTE_KEY);
    const map = stored ? JSON.parse(stored) : {};
    if (noteId) map[projectId] = noteId;
    else delete map[projectId];
    localStorage.setItem(LAST_NOTE_KEY, JSON.stringify(map));
  } catch {}
}
