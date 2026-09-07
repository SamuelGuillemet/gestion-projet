import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MdxTaskDescriptionEditor } from "./MdxTaskDescriptionEditor";
import { NativeTaskDescriptionEditor } from "./NativeTaskDescriptionEditor";

type EditorMode = "mdx" | "native";

interface TaskDescriptionEditorProps {
  value: string;
  projectId: string;
  onChange: (value: string) => void;
}

export function TaskDescriptionEditor({ value, projectId, onChange }: TaskDescriptionEditorProps) {
  const [mode, setMode] = useState<EditorMode>("mdx");

  return (
    <div className="mt-1 space-y-1.5">
      <div
        className="flex w-fit rounded-md border bg-muted/45 p-0.5"
        aria-label="Éditeur de description"
      >
        <Button
          type="button"
          variant={mode === "mdx" ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setMode("mdx")}
        >
          MDXEditor
        </Button>
        <Button
          type="button"
          variant={mode === "native" ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setMode("native")}
        >
          Natif
        </Button>
      </div>

      <div className="task-description-editor">
        {mode === "mdx" ? (
          <MdxTaskDescriptionEditor value={value} projectId={projectId} onChange={onChange} />
        ) : (
          <NativeTaskDescriptionEditor value={value} projectId={projectId} onChange={onChange} />
        )}
      </div>
    </div>
  );
}
