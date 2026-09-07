import { Archive, ArrowRightLeft, Import, Tags } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackupsPanel } from "./BackupsPanel";
import { ImportExportPanel } from "./ImportExportPanel";
import { TagsPanel } from "./TagsPanel";
import { TaskMigrationPanel } from "./TaskMigrationPanel";

export function SettingsPage() {
  return (
    <div className="no-scrollbar h-full overflow-y-auto rounded-lg border border-border bg-card p-4">
      <Tabs defaultValue="tags" orientation="vertical" className="h-full items-start gap-6">
        <TabsList variant="line" className="h-fit w-48 shrink-0 items-stretch gap-1">
          <TabsTrigger value="tags">
            <Tags className="size-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="backups">
            <Archive className="size-4" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="import-export">
            <Import className="size-4" />
            Import / Export
          </TabsTrigger>
          <TabsTrigger value="migration">
            <ArrowRightLeft className="size-4" />
            Migration
          </TabsTrigger>
        </TabsList>
        <Separator orientation="vertical" className="h-full" />
        <div className="no-scrollbar h-full min-w-0 flex-1 overflow-y-auto">
          <TabsContent value="tags">
            <TagsPanel />
          </TabsContent>
          <TabsContent value="backups">
            <BackupsPanel />
          </TabsContent>
          <TabsContent value="import-export">
            <ImportExportPanel />
          </TabsContent>
          <TabsContent value="migration">
            <TaskMigrationPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
