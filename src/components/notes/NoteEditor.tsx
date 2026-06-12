import { FileText, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNote, useNoteActions, useNoteIds } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";
import { getLastNoteId, setLastNoteId } from "@/lib/notes";

export function NotesPage() {
  const { activeProjectId } = useProjects();
  const noteIds = useNoteIds(activeProjectId);
  const { addNote, updateNote, deleteNote } = useNoteActions();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() =>
    getLastNoteId(activeProjectId),
  );
  const [content, setContent] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = useNote(activeNoteId ?? "");

  // Auto-select last opened note or first note when project changes
  useEffect(() => {
    if (noteIds.length > 0 && !noteIds.includes(activeNoteId ?? "")) {
      const lastId = getLastNoteId(activeProjectId);
      const restored = lastId && noteIds.includes(lastId);
      setActiveNoteId(restored ? lastId : noteIds[0]);
    }
  }, [noteIds, activeNoteId, activeProjectId]);

  // Persist active note selection
  useEffect(() => {
    setLastNoteId(activeProjectId, activeNoteId);
  }, [activeProjectId, activeNoteId]);

  // Sync content when active note changes
  useEffect(() => {
    setContent(activeNote?.content ?? "");
  }, [activeNote?.content]);

  const save = useCallback(
    (value: string) => {
      if (!activeNoteId) return;
      updateNote(activeNoteId, { content: value });
    },
    [activeNoteId, updateNote],
  );

  const handleChange = (value: string) => {
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), 500);
  };

  const handleAddNote = () => {
    if (!activeProjectId) return;
    addNote(activeProjectId, "Sans titre");
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (activeNoteId === id) {
      const remaining = noteIds.filter((nid) => nid !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleRename = (id: string, title: string) => {
    updateNote(id, { title });
  };

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden">
      {/* Left sidebar: note list */}
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
            <Plus className="w-3.5 h-3.5" />
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

      {/* Right: editor + preview */}
      {activeNote ? (
        <div className="overflow-y-auto grow">
          <div className="flex-1 gap-4 grid grid-cols-2 p-4 min-w-0 h-min min-h-full">
            <div className="flex flex-col p-1 min-h-0">
              <span className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Édition
              </span>
              <Textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 min-h-0 font-mono text-sm resize-none"
                placeholder="Écrivez vos notes en Markdown..."
              />
            </div>
            <div className="flex flex-col p-1 min-h-0">
              <span className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Prévisualisation
              </span>
              <div className="flex-1 bg-card p-5 border rounded-lg min-h-0 overflow-y-auto">
                <article className="prose-code:bg-muted prose-pre:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:border prose-code:rounded max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary/80 prose prose-sm prose-slate">
                  <Markdown
                    remarkPlugins={[
                      remarkGfm,
                      remarkBreaks,
                      remarkGithubAlerts,
                    ]}
                  >
                    {content || "*Aucun contenu...*"}
                  </Markdown>
                </article>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 justify-center items-center text-muted-foreground">
          <div className="space-y-2 text-center">
            <FileText className="opacity-30 mx-auto w-10 h-10" />
            <p className="text-sm">Créez une note pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteFileItem({
  noteId,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  noteId: string;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const note = useNote(noteId);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note?.title ?? "");

  if (!note) return null;

  const handleSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div
      className={`group flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-colors ${
        active ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <FileText className="opacity-60 w-3.5 h-3.5 shrink-0" />
      {editing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="px-1 py-0 h-5 text-xs"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-xs truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(note.title);
            setEditing(true);
          }}
        >
          {note.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 w-5 h-5 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
