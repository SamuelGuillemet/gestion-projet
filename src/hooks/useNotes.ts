import { useShallow } from "zustand/react/shallow";
import { useNoteStore } from "@/store";
import { deleteNoteCascade } from "@/store/cascade-delete";

export function useNoteIds(projectId: string | null) {
  return useNoteStore(
    useShallow((s) =>
      s.notes.filter((n) => n.projectId === projectId).map((n) => n.id),
    ),
  );
}

export function useNote(id: string) {
  return useNoteStore((s) => s.notes.find((n) => n.id === id));
}

export function useNoteActions() {
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const deleteNote = deleteNoteCascade;
  return { addNote, updateNote, deleteNote };
}
