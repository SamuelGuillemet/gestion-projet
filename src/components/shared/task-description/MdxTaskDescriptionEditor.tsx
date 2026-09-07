import {
  BoldItalicUnderlineToggles,
  CreateLink,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  StrikeThroughSupSubToggles,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { useEffect, useRef } from "react";
import { useEntityReferenceNavigation } from "@/hooks/useEntityReferenceNavigation";
import { parseEntityReference } from "@/lib/entity-references";

interface MdxTaskDescriptionEditorProps {
  value: string;
  projectId: string;
  onChange: (value: string) => void;
}

const ENTITY_REFERENCE_LINK_REGEX = /\[([#?!%]\d+)\]\(entity:\1\)/g;
const PROTECTED_MARKDOWN_REGEX = /(`[^`\n]*`|\[[^\]]*\]\([^)]*\))/g;

function encodeTextReferences(value: string) {
  return value.replace(
    /(^|[\s([{])([#?!%]\d+)(?=$|[\s.,;:)\]}])/g,
    "$1[$2](entity:$2)",
  );
}

function encodeEntityReferences(markdown: string) {
  let result = "";
  let lastIndex = 0;

  for (const match of markdown.matchAll(PROTECTED_MARKDOWN_REGEX)) {
    const index = match.index ?? 0;
    result += encodeTextReferences(markdown.slice(lastIndex, index));
    result += match[0];
    lastIndex = index + match[0].length;
  }

  return result + encodeTextReferences(markdown.slice(lastIndex));
}

function decodeEntityReferences(markdown: string) {
  return markdown.replace(ENTITY_REFERENCE_LINK_REGEX, "$1");
}

export function MdxTaskDescriptionEditor({
  value,
  projectId,
  onChange,
}: MdxTaskDescriptionEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const openEntity = useEntityReferenceNavigation(projectId);
  const editorMarkdown = encodeEntityReferences(value);

  useEffect(() => {
    if (editorRef.current?.getMarkdown() !== editorMarkdown) {
      editorRef.current?.setMarkdown(editorMarkdown);
    }
  }, [editorMarkdown]);

  const openEntityReference = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target.closest('a[href^="entity:"]') : null;
    const label = target?.getAttribute("href")?.slice("entity:".length) ?? "";
    const reference = parseEntityReference(label);
    if (!reference) return;

    event.preventDefault();
    openEntity(reference);
  };

  return (
    <div onClick={openEntityReference}>
      <MDXEditor
        ref={editorRef}
        markdown={editorMarkdown}
        onChange={(markdown) => onChange(decodeEntityReferences(markdown))}
        contentEditableClassName="task-description-content"
        placeholder="Ajouter une description..."
        plugins={[
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
                <StrikeThroughSupSubToggles options={["Strikethrough"]} />
                <ListsToggle options={["bullet", "number"]} />
                <CreateLink />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
