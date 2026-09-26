import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useTags } from "@/hooks/useTags";

const generateRandomHex = () =>
  `#${Math.trunc((1 << 24) * Math.random())
    .toString(16)
    .padStart(6, "0")}`;

export function TagsPanel() {
  const { tags, addTag, updateTag, deleteTag } = useTags();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(generateRandomHex);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTag(newName.trim(), newColor);
    setNewName("");
    setNewColor(generateRandomHex());
  };

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setEditName(name);
    setEditColor(color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateTag(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  return (
    <div className="mt-2 space-y-4">
      <div className="flex max-w-sm items-center gap-2">
        <input
          type="color"
          aria-label="New tag color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-full border"
        />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nouveau tag..."
          className="h-8 text-sm"
        />
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">Aucun tag créé.</p>
      )}
      <div className="grid max-h-list grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="group flex items-center gap-2 rounded-md border border-transparent p-1.5 hover:border-border hover:bg-muted/50"
          >
            {editingId === tag.id ? (
              <>
                <input
                  type="color"
                  aria-label="Edit tag color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-6 w-6 shrink-0 cursor-pointer rounded-full border"
                />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 text-xs"
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={saveEdit}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate text-sm">{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => startEdit(tag.id, tag.name, tag.color)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <ConfirmDialog
                  triggerClassName="inline-flex"
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  }
                  title="Supprimer le tag"
                  description="Cette action est irréversible. Le tag sera définitivement supprimé."
                  onConfirm={() => deleteTag(tag.id)}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
