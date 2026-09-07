import { useProjects } from "@/hooks/useProjects";
import { NoteEditorPanel } from "./NoteEditorPanel";
import { NoteList } from "./NoteList";
import { useActiveNoteId, useNotesUI } from "./notes-state";

export function NotesPage() {
  const { activeProjectId } = useProjects();
  const activeNoteId = useActiveNoteId(activeProjectId ?? "");
  const setStoredActiveNoteId = useNotesUI((s) => s.setActiveNoteId);

  if (!activeProjectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  const setActiveNoteId = (noteId: string | null) => {
    setStoredActiveNoteId(activeProjectId, noteId);
  };

  return (
    <div className="flex h-full overflow-hidden rounded-md border bg-card">
      <NoteList activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId} />

      {activeNoteId ? (
        <NoteEditorPanel key={activeNoteId} activeNoteId={activeNoteId} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-10 w-10 opacity-30" />
            <p className="text-sm">Créez une note pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}
