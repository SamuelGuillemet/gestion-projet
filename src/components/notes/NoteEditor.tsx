import { FileText, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkGithubAlerts from "remark-github-alerts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/useNotes";
import { useProjects } from "@/hooks/useProjects";

const LAST_NOTE_KEY = "gestion-projet-last-note";

function getLastNoteId(projectId: string | null): string | null {
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

function setLastNoteId(projectId: string | null, noteId: string | null) {
  if (!projectId) return;
  try {
    const stored = localStorage.getItem(LAST_NOTE_KEY);
    const map = stored ? JSON.parse(stored) : {};
    if (noteId) map[projectId] = noteId;
    else delete map[projectId];
    localStorage.setItem(LAST_NOTE_KEY, JSON.stringify(map));
  } catch {}
}

export function NotesPage() {
  const { activeProjectId } = useProjects();
  const { notes, addNote, updateNote, deleteNote } = useNotes(activeProjectId);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() =>
    getLastNoteId(activeProjectId),
  );
  const [content, setContent] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  // Auto-select last opened note or first note when project changes
  useEffect(() => {
    if (notes.length > 0 && !notes.find((n) => n.id === activeNoteId)) {
      const lastId = getLastNoteId(activeProjectId);
      const restored = lastId && notes.find((n) => n.id === lastId);
      setActiveNoteId(restored ? lastId : notes[0].id);
    }
  }, [notes, activeNoteId, activeProjectId]);

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
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRename = (id: string, title: string) => {
    updateNote(id, { title });
  };

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex overflow-hidden">
      {/* Left sidebar: note list */}
      <div className="w-52 shrink-0 border-r flex flex-col">
        <div className="p-2 border-b flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Notes
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleAddNote}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {notes.length === 0 && (
            <p className="text-xs text-muted-foreground p-3 text-center">
              Aucune note. Cliquez + pour en créer une.
            </p>
          )}
          {notes.map((note) => (
            <NoteFileItem
              key={note.id}
              title={note.title}
              active={note.id === activeNoteId}
              onSelect={() => setActiveNoteId(note.id)}
              onRename={(title) => handleRename(note.id, title)}
              onDelete={() => handleDelete(note.id)}
            />
          ))}
        </div>
      </div>

      {/* Right: editor + preview */}
      {activeNote ? (
        <div className="overflow-y-auto grow">
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-w-0 h-min min-h-full">
            <div className="flex flex-col min-h-0 p-1">
              <span className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
                Édition
              </span>
              <Textarea
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 resize-none font-mono text-sm min-h-0"
                placeholder="Écrivez vos notes en Markdown..."
              />
            </div>
            <div className="flex flex-col min-h-0 p-1">
              <span className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
                Prévisualisation
              </span>
              <div className="flex-1 overflow-y-auto border rounded-lg p-5 bg-card min-h-0">
                <article className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary/80 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border">
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
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <FileText className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm">Créez une note pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteFileItem({
  title,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  title: string;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

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
      <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
      {editing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-5 text-xs px-1 py-0"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="text-xs truncate flex-1"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditValue(title);
            setEditing(true);
          }}
        >
          {title}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
