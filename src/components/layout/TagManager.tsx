import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTags } from "@/hooks/useTags";

const generateRandomHex = () =>
  `#${Math.trunc((1 << 24) * Math.random())
    .toString(16)
    .padStart(6, "0")}`;

export function TagManager() {
  const { tags, addTag, updateTag, deleteTag } = useTags();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("");
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
    <Dialog onOpenChange={(open) => open && setNewColor(generateRandomHex())}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Tags className="w-4 h-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gérer les tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Add new tag */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="border rounded-full w-8 h-8 cursor-pointer shrink-0"
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nouveau tag..."
              className="h-8 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 shrink-0"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tag list */}
          {tags.length === 0 && (
            <p className="py-4 text-muted-foreground text-xs text-center">
              Aucun tag créé.
            </p>
          )}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-md"
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="border rounded-full w-6 h-6 cursor-pointer shrink-0"
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
                      className="w-7 h-7 shrink-0"
                      onClick={saveEdit}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 shrink-0"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className="rounded-full w-3 h-3 shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-sm truncate">{tag.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-opacity"
                      onClick={() => startEdit(tag.id, tag.name, tag.color)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <ConfirmDialog
                      triggerClassName="inline-flex"
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 text-destructive transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
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
      </DialogContent>
    </Dialog>
  );
}
