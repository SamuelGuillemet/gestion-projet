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
    <div className="flex flex-col border-r w-52 shrink-0">
      <div className="flex justify-between items-center p-2 border-b">
        <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Notes
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleAddNote}
        >
          +
        </Button>
      </div>
      <div className="flex-1 py-1 overflow-y-auto">
        {noteIds.length === 0 && (
          <p className="p-3 text-muted-foreground text-xs text-center">
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
