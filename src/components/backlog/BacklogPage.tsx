import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useProjects } from "@/hooks/useProjects";
import { BacklogDetailPanel } from "./BacklogDetailPanel";
import { BacklogList } from "./BacklogList";
import { useBacklogUI } from "./backlog-state";

export function BacklogPage() {
  const { activeProjectId } = useProjects();
  const selectedDetail = useBacklogUI((s) => s.selectedDetail);
  const hasSelection = selectedDetail !== null;
  const panelSize = useBacklogUI((s) => s.panelSize);
  const setPanelSize = useBacklogUI((s) => s.setPanelSize);

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      className="gap-3 h-full!"
      onLayoutChanged={(e) => setPanelSize(e["detail-panel"])}
    >
      <ResizablePanel className="pr-1 overflow-y-auto" id="tree-view-panel">
        <BacklogList activeProjectId={activeProjectId} />
      </ResizablePanel>

      {hasSelection && (
        <>
          <ResizableHandle
            withHandle
            handleClassName="bg-muted-foreground/15 w-1"
            className="bg-muted-foreground/10 w-0.5"
          />
          <ResizablePanel
            className="bg-card border rounded-md overflow-y-auto"
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
