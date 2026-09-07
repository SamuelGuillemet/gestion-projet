import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useProjects } from "@/hooks/useProjects";
import { useBacklogUI } from "./backlog-state";
import { BacklogDetailPanel } from "./BacklogDetailPanel";
import { BacklogList } from "./BacklogList";

export function BacklogPage() {
  const { activeProjectId } = useProjects();
  const selectedDetail = useBacklogUI((s) => s.selectedDetail);
  const hasSelection = selectedDetail !== null;
  const panelSize = useBacklogUI((s) => s.panelSize);
  const setPanelSize = useBacklogUI((s) => s.setPanelSize);

  if (!activeProjectId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      className="h-full! gap-3"
      onLayoutChanged={(e) => setPanelSize(e["detail-panel"])}
    >
      <ResizablePanel className="overflow-y-auto pr-1" id="tree-view-panel">
        <BacklogList activeProjectId={activeProjectId} />
      </ResizablePanel>

      {hasSelection && (
        <>
          <ResizableHandle
            withHandle
            handleClassName="bg-muted-foreground/15 w-1"
            className="w-0.5 bg-muted-foreground/10"
          />
          <ResizablePanel
            className="overflow-y-auto rounded-md border bg-card"
            id="detail-panel"
            defaultSize={panelSize}
          >
            <BacklogDetailPanel />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
