import { useEffect, useState } from "react";
import { useGlobalSearchState } from "@/components/layout/global-search-state";
import { useNote, useNoteIds } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { getLastNoteId, setLastNoteId } from "@/lib/notes";
import { NoteEditorPanel } from "./NoteEditorPanel";
import { NoteList } from "./NoteList";

export function NotesPage() {
  const { activeProjectId } = useProjects();
  const pendingNoteIntent = useGlobalSearchState((s) => s.pendingNoteIntent);
  const setPendingNoteIntent = useGlobalSearchState(
    (s) => s.setPendingNoteIntent,
  );
  const noteIds = useNoteIds(activeProjectId);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() =>
    getLastNoteId(activeProjectId),
  );

  const activeNote = useNote(activeNoteId ?? "");

  // Auto-select last opened note or first note when project changes
  useEffect(() => {
    if (pendingNoteIntent?.projectId === activeProjectId) {
      if (noteIds.includes(pendingNoteIntent.noteId)) {
        setActiveNoteId(pendingNoteIntent.noteId);
      }
      setPendingNoteIntent(null);
      return;
    }

    if (noteIds.length > 0 && !noteIds.includes(activeNoteId ?? "")) {
      const lastId = getLastNoteId(activeProjectId);
      const restored = lastId && noteIds.includes(lastId);
      setActiveNoteId(restored ? lastId : noteIds[0]);
    }
  }, [
    noteIds,
    activeNoteId,
    activeProjectId,
    pendingNoteIntent,
    setPendingNoteIntent,
  ]);

  // Persist active note selection
  useEffect(() => {
    setLastNoteId(activeProjectId, activeNoteId);
  }, [activeProjectId, activeNoteId]);

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="flex bg-card border rounded-md h-full overflow-hidden">
      <NoteList activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId} />

      {activeNote ? (
        <NoteEditorPanel activeNoteId={activeNoteId} activeNote={activeNote} />
      ) : (
        <div className="flex flex-1 justify-center items-center text-muted-foreground">
          <div className="space-y-2 text-center">
            <div className="opacity-30 mx-auto w-10 h-10" />
            <p className="text-sm">Créez une note pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}
