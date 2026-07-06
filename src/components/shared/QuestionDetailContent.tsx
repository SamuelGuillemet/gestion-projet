import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_STATUSES } from "@/constants/question-status";
import { cn } from "@/lib/utils";
import type { Question } from "@/models/question";
import { HighlightLinks } from "./HighlightLinks";
import { RelationManager } from "./RelationManager";

interface QuestionDetailContentProps {
  question: Question;
  onUpdate: (data: Partial<Omit<Question, "id" | "projectId">>) => void;
  onDelete: () => void;
}

export function QuestionDetailContent({
  question,
  onUpdate,
  onDelete,
}: QuestionDetailContentProps) {
  return (
    <div className="flex flex-col gap-4 grow">
      <div>
        <Label className="text-muted-foreground text-xs">Titre</Label>
        <Input
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Description</Label>
        <Textarea
          value={question.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="mt-1 min-h-16"
          placeholder="Détail de la question..."
        />
        <HighlightLinks
          text={question.description}
          className="mt-2 text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap"
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Destinataire</Label>
        <Input
          value={question.recipient ?? ""}
          onChange={(e) => onUpdate({ recipient: e.target.value })}
          className="mt-1"
          placeholder="Nom ou email du destinataire..."
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Réponse</Label>
        <Textarea
          value={question.answer ?? ""}
          onChange={(e) => onUpdate({ answer: e.target.value })}
          className="mt-1 min-h-24"
          placeholder="Réponse à la question..."
        />
      </div>

      <div>
        <Label className="text-muted-foreground text-xs">Statut</Label>
        <div className="flex gap-1 mt-1">
          {QUESTION_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onUpdate({ status: s.value })}
              className={cn(
                "px-2 py-1 rounded font-medium text-xs transition-colors",
                question.status === s.value
                  ? "ring-2 ring-offset-1"
                  : "opacity-60 hover:opacity-100 border border-muted-foreground/20",
              )}
              style={{ backgroundColor: `${s.color}20`, color: s.color }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <RelationManager itemId={question.id} projectId={question.projectId} />

      <div className="grow" />

      <div className="pt-2 border-t">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" size="sm" className="w-full">
              <Trash2 className="mr-1 w-3 h-3" />
              Supprimer
            </Button>
          }
          title="Supprimer la question"
          description="Cette action est irréversible. La question et toutes ses relations seront supprimées."
          onConfirm={() => {
            onDelete();
          }}
        />
      </div>
    </div>
  );
}
