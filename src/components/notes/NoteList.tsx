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
    <div className="flex flex-col bg-background/60 border-r w-60 shrink-0">
      <div className="flex justify-between items-center p-3 border-b">
        <span className="text-muted-foreground atelier-section-title">
          Notes
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7"
          onClick={handleAddNote}
        >
          +
        </Button>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        {noteIds.length === 0 && (
          <p className="p-3 border border-dashed rounded-md text-muted-foreground text-xs text-center">
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
