import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBacklogUI } from "./backlog-state";
import { DeliverableDetailPanel, QuestionDetailPanel, TaskDetailPanel } from "./panel";

export function BacklogDetailPanel() {
  const selectedDetail = useBacklogUI((s) => s.selectedDetail);
  const clear = useBacklogUI((s) => s.clear);

  if (!selectedDetail) return null;

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h3 className="atelier-section-title text-foreground">Détail</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {selectedDetail.type === "tasks" && <TaskDetailPanel taskId={selectedDetail.id} />}
      {selectedDetail.type === "questions" && (
        <QuestionDetailPanel questionId={selectedDetail.id} />
      )}
      {selectedDetail.type === "deliverables" && (
        <DeliverableDetailPanel deliverableId={selectedDetail.id} />
      )}
    </div>
  );
}
