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
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  const setActiveNoteId = (noteId: string | null) => {
    setStoredActiveNoteId(activeProjectId, noteId);
  };

  return (
    <div className="flex bg-card border rounded-md h-full overflow-hidden">
      <NoteList activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId} />

      {activeNoteId ? (
        <NoteEditorPanel activeNoteId={activeNoteId} />
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
