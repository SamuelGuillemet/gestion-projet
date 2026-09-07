import { useState } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { TaskRow } from "./TackRow";

export function TaskGroupRow({ taskId, subtaskIds }: { taskId: string; subtaskIds: string[] }) {
  const [open, setOpen] = useState(true);
  const hasSubtasks = subtaskIds.length > 0;

  if (!hasSubtasks) {
    return <TaskRow taskId={taskId} />;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TaskRow taskId={taskId} toggle={{ open, onToggle: () => setOpen((prev) => !prev) }} />
      <CollapsibleContent className="mt-1 ml-5 space-y-1 border-l border-border/70 pl-3">
        {subtaskIds.map((subtaskId) => (
          <TaskRow key={subtaskId} taskId={subtaskId} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
