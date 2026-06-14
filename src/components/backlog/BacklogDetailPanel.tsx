import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBacklogUI } from "./backlog-state";
import {
  DeliverableDetailPanel,
  QuestionDetailPanel,
  TaskDetailPanel,
} from "./panel";

export function BacklogDetailPanel() {
  const selectedDetail = useBacklogUI((s) => s.selectedDetail);
  const clear = useBacklogUI((s) => s.clear);

  if (!selectedDetail) return null;

  return (
    <div className="flex flex-col p-4 pl-1 w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Détail</h3>
        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={clear}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {selectedDetail.type === "tasks" && (
        <TaskDetailPanel taskId={selectedDetail.id} />
      )}
      {selectedDetail.type === "questions" && (
        <QuestionDetailPanel questionId={selectedDetail.id} />
      )}
      {selectedDetail.type === "deliverables" && (
        <DeliverableDetailPanel deliverableId={selectedDetail.id} />
      )}
    </div>
  );
}
