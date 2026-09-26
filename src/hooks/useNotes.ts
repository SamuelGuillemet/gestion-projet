import { useShallow } from "zustand/react/shallow";
import { useNoteStore } from "@/store";
import { deleteNoteCascade } from "@/store/cascade-delete";

export function useNoteIds(projectId: string | null) {
  return useNoteStore(
    useShallow((s) => s.notes.filter((n) => n.projectId === projectId).map((n) => n.id)),
  );
}

export function useNote(id: string) {
  return useNoteStore((s) => s.notes.find((n) => n.id === id));
}

export function useNoteFolderIdByNoteId(projectId: string | null) {
  return useNoteStore(
    useShallow((s) =>
      Object.fromEntries(
        s.notes.filter((n) => n.projectId === projectId).map((n) => [n.id, n.folderId ?? null]),
      ),
    ),
  );
}

export function useNoteFolders(projectId: string | null) {
  return useNoteStore(useShallow((s) => s.noteFolders.filter((f) => f.projectId === projectId)));
}

export function useNoteActions() {
  const addNote = useNoteStore((s) => s.addNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const moveNote = useNoteStore((s) => s.moveNote);
  const deleteNote = deleteNoteCascade;
  return { addNote, updateNote, moveNote, deleteNote };
}

export function useNoteFolderActions() {
  const addNoteFolder = useNoteStore((s) => s.addNoteFolder);
  const renameNoteFolder = useNoteStore((s) => s.renameNoteFolder);
  const deleteNoteFolder = useNoteStore((s) => s.deleteNoteFolder);
  const moveNoteFolder = useNoteStore((s) => s.moveNoteFolder);
  return { addNoteFolder, renameNoteFolder, deleteNoteFolder, moveNoteFolder };
}
