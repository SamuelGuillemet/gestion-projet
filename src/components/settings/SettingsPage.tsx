import {
  Archive,
  ArrowRightLeft,
  Import,
  MessageSquare,
  Tags,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackupsPanel } from "./BackupsPanel";
import { ChatRoomPanel } from "./ChatRoomPanel";
import { ImportExportPanel } from "./ImportExportPanel";
import { TagsPanel } from "./TagsPanel";
import { TaskMigrationPanel } from "./TaskMigrationPanel";

export function SettingsPage() {
  return (
    <div className="bg-card p-4 border border-border rounded-lg h-full overflow-y-auto no-scrollbar">
      <Tabs
        defaultValue="tags"
        orientation="vertical"
        className="items-start gap-6 h-full"
      >
        <TabsList
          variant="line"
          className="items-stretch gap-1 w-48 h-fit shrink-0"
        >
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
          <TabsTrigger value="p2p">
            <MessageSquare className="size-4" />
            Chat P2P (test)
          </TabsTrigger>
        </TabsList>
        <Separator orientation="vertical" className="h-full" />
        <div className="flex-1 min-w-0 h-full overflow-y-auto no-scrollbar">
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
          <TabsContent value="p2p">
            <ChatRoomPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
