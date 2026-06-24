import { useEffect } from "react";
import { useGlobalSearchState } from "@/components/layout/global-search-state";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useChangeValueEffect } from "@/hooks/useChangeValueEffect";
import { useProjects } from "@/hooks/useProjects";
import { BacklogDetailPanel } from "./BacklogDetailPanel";
import { BacklogList } from "./BacklogList";
import { useBacklogUI } from "./backlog-state";

export function BacklogPage() {
  const { activeProjectId } = useProjects();
  const hasSelection = useBacklogUI((s) => s.selectedDetail !== null);
  const clear = useBacklogUI((s) => s.clear);
  const select = useBacklogUI((s) => s.select);
  const panelSize = useBacklogUI((s) => s.panelSize);
  const setPanelSize = useBacklogUI((s) => s.setPanelSize);
  const pendingBacklogIntent = useGlobalSearchState(
    (s) => s.pendingBacklogIntent,
  );
  const setPendingBacklogIntent = useGlobalSearchState(
    (s) => s.setPendingBacklogIntent,
  );

  console.log(panelSize);

  useEffect(() => {
    if (
      !pendingBacklogIntent ||
      pendingBacklogIntent.projectId !== activeProjectId
    ) {
      return;
    }

    select({ type: pendingBacklogIntent.type, id: pendingBacklogIntent.id });
    setPendingBacklogIntent(null);
  }, [activeProjectId, pendingBacklogIntent, select, setPendingBacklogIntent]);

  useChangeValueEffect(() => {
    if (pendingBacklogIntent?.projectId === activeProjectId) {
      return;
    }
    clear();
  }, activeProjectId);

  if (!activeProjectId) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Sélectionnez ou créez un projet pour commencer.
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      className="gap-4 h-[calc(100vh-100px)]!"
      onLayoutChanged={(e) => setPanelSize(e["detail-panel"])}
    >
      <ResizablePanel className="overflow-y-auto" id="tree-view-panel">
        <BacklogList activeProjectId={activeProjectId} />
      </ResizablePanel>

      {hasSelection && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            className="overflow-y-auto"
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
