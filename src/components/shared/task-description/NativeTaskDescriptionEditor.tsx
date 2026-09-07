import { Bold, Italic, Link, List, ListOrdered, Strikethrough } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useEntityReferenceNavigation } from "@/hooks/useEntityReferenceNavigation";
import { parseEntityReference } from "@/lib/entity-references";

interface NativeTaskDescriptionEditorProps {
  value: string;
  projectId: string;
  onChange: (value: string) => void;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /(^|[\s([{])([#?!%]\d+)(?=$|[\s.,;:)\]}])/g,
      '$1<a href="#" data-entity-reference="$2" contenteditable="false">$2</a>',
    );
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];

  for (let index = 0; index < lines.length;) {
    const unordered = lines[index]?.match(/^[-*]\s+(.*)$/);
    const ordered = lines[index]?.match(/^\d+\.\s+(.*)$/);

    if (unordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index]?.match(/^[-*]\s+(.*)$/);
        if (!match) break;
        items.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index]?.match(/^\d+\.\s+(.*)$/);
        if (!match) break;
        items.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    html.push(lines[index] ? `<p>${renderInlineMarkdown(lines[index])}</p>` : "<p><br></p>");
    index += 1;
  }

  return html.join("");
}

function nodeToMarkdown(node: globalThis.Node): string {
  if (node.nodeType === globalThis.Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  const content = [...node.childNodes].map(nodeToMarkdown).join("");
  switch (node.tagName) {
    case "STRONG":
    case "B":
      return `**${content}**`;
    case "EM":
    case "I":
      return `*${content}*`;
    case "S":
    case "STRIKE":
    case "DEL":
      return `~~${content}~~`;
    case "A":
      if (node.dataset.entityReference) return node.dataset.entityReference;
      return `[${content}](${node.getAttribute("href") ?? ""})`;
    case "BR":
      return "\n";
    case "UL":
      return `${[...node.children]
        .map((item) => `- ${[...item.childNodes].map(nodeToMarkdown).join("").trim()}`)
        .join("\n")}\n`;
    case "OL":
      return `${[...node.children]
        .map(
          (item, index) =>
            `${index + 1}. ${[...item.childNodes].map(nodeToMarkdown).join("").trim()}`,
        )
        .join("\n")}\n`;
    case "P":
    case "DIV":
      return `${content}\n`;
    case "LI":
      return content;
    default:
      return content;
  }
}

function htmlToMarkdown(element: HTMLElement) {
  return [...element.childNodes]
    .map(nodeToMarkdown)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function NativeTaskDescriptionEditor({
  value,
  projectId,
  onChange,
}: NativeTaskDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const openEntity = useEntityReferenceNavigation(projectId);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;

    const nextHtml = markdownToHtml(value);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [value]);

  const format = (command: string, argument?: string) => {
    document.execCommand(command, false, argument);
    const editor = editorRef.current;
    if (editor) onChange(htmlToMarkdown(editor));
  };

  const addLink = () => {
    const url = window.prompt("Adresse du lien", "https://");
    if (url?.startsWith("https://") || url?.startsWith("http://")) format("createLink", url);
  };

  const openEntityReference = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target.closest("[data-entity-reference]") : null;
    const reference = parseEntityReference(target?.getAttribute("data-entity-reference") ?? "");
    if (!reference) return;

    event.preventDefault();
    openEntity(reference);
  };

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div
        role="toolbar"
        aria-label="Mise en forme"
        className="flex items-center gap-0.5 border-b p-1"
      >
        <FormatButton label="Gras" icon={Bold} onClick={() => format("bold")} />
        <FormatButton label="Italique" icon={Italic} onClick={() => format("italic")} />
        <FormatButton label="Barré" icon={Strikethrough} onClick={() => format("strikeThrough")} />
        <FormatButton
          label="Liste à puces"
          icon={List}
          onClick={() => format("insertUnorderedList")}
        />
        <FormatButton
          label="Liste numérotée"
          icon={ListOrdered}
          onClick={() => format("insertOrderedList")}
        />
        <FormatButton label="Lien" icon={Link} onClick={addLink} />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Description de la tâche"
        data-placeholder="Ajouter une description..."
        onInput={(event) => onChange(htmlToMarkdown(event.currentTarget))}
        onClick={openEntityReference}
        className="task-description-content min-h-24 px-3 py-2 outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

interface FormatButtonProps {
  label: string;
  icon: typeof Bold;
  onClick: () => void;
}

function FormatButton({ label, icon: Icon, onClick }: FormatButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon />
    </Button>
  );
}
