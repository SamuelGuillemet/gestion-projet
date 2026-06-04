import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/models/task";
import { useAppStore } from "@/store";

const CARD_COLORS = [
  "",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
];

interface CardDetailProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetail({ task, open, onOpenChange }: CardDetailProps) {
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const tags = useAppStore((s) => s.tags);
  const addTag = useAppStore((s) => s.addTag);
  const [newTagName, setNewTagName] = useState("");

  const toggleTag = (tagId: string) => {
    const newTags = task.tags.includes(tagId)
      ? task.tags.filter((id) => id !== tagId)
      : [...task.tags, tagId];
    updateTask(task.id, { tags: newTags });
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    addTag(newTagName.trim(), randomColor);
    setNewTagName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Détail de la tâche</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="task-title">Titre</Label>
            <Input
              id="task-title"
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={task.description}
              onChange={(e) =>
                updateTask(task.id, { description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div>
            <Label>Couleur</Label>
            <div className="flex gap-2 mt-1">
              {CARD_COLORS.map((color) => (
                <button
                  key={color || "none"}
                  type="button"
                  className={`h-6 w-6 rounded-full border-2 ${
                    task.color === color ? "border-foreground" : "border-muted"
                  } ${!color ? "bg-muted" : ""}`}
                  style={color ? { backgroundColor: color } : undefined}
                  onClick={() => updateTask(task.id, { color })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={task.tags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    task.tags.includes(tag.id)
                      ? { backgroundColor: tag.color }
                      : { borderColor: tag.color, color: tag.color }
                  }
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Nouveau tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="h-8 text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleAddTag}>
                +
              </Button>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              deleteTask(task.id);
              onOpenChange(false);
            }}
            className="w-full"
          >
            <Trash2 className="mr-1 w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
