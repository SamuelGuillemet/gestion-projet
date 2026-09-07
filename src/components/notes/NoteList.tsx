import { Button } from "@/components/ui/button";
import { useNoteActions, useNoteIds } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { NoteFileItem } from "./NoteFileItem";

type Props = {
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
};

export function NoteList({ activeNoteId, setActiveNoteId }: Props) {
  const { activeProjectId } = useProjects();
  const { addNote, updateNote, deleteNote } = useNoteActions();
  const noteIds = useNoteIds(activeProjectId);

  const handleAddNote = () => {
    if (!activeProjectId) return;
    addNote(activeProjectId, "Sans titre");
  };

  const handleRename = (id: string, title: string) => {
    updateNote(id, { title });
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (activeNoteId === id) {
      const remaining = noteIds.filter((nid) => nid !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="flex w-60 shrink-0 flex-col border-r bg-background/60">
      <div className="flex items-center justify-between border-b p-3">
        <span className="atelier-section-title text-muted-foreground">Notes</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddNote}>
          +
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {noteIds.length === 0 && (
          <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
            Aucune note. Cliquez + pour en créer une.
          </p>
        )}
        {noteIds.map((id) => (
          <NoteFileItem
            key={id}
            noteId={id}
            active={id === activeNoteId}
            onSelect={() => setActiveNoteId(id)}
            onRename={(title) => handleRename(id, title)}
            onDelete={() => handleDelete(id)}
          />
        ))}
      </div>
    </div>
  );
}
