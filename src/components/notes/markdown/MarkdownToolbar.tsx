import {
  Bold,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
  Strikethrough,
  Table as TableIcon,
} from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  insertBlock,
  insertLink,
  toggleCodeBlock,
  toggleHeading,
  toggleOrderedList,
  togglePrefix,
  toggleWrap,
} from "./markdown-editing";

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const TABLE_TEMPLATE =
  "| Colonne 1 | Colonne 2 |\n| --- | --- |\n| Valeur 1 | Valeur 2 |";

export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
  className,
}: Props) {
  const withTextarea = (action: (textarea: HTMLTextAreaElement) => void) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    action(textarea);
  };

  const actions = [
    {
      label: "Gras",
      icon: Bold,
      perform: (t: HTMLTextAreaElement) =>
        toggleWrap(t, value, "**", "**", "texte en gras", onChange),
    },
    {
      label: "Italique",
      icon: Italic,
      perform: (t: HTMLTextAreaElement) =>
        toggleWrap(t, value, "*", "*", "texte en italique", onChange),
    },
    {
      label: "Barré",
      icon: Strikethrough,
      perform: (t: HTMLTextAreaElement) =>
        toggleWrap(t, value, "~~", "~~", "texte barré", onChange),
    },
    {
      label: "Code",
      icon: Code,
      perform: (t: HTMLTextAreaElement) =>
        toggleWrap(t, value, "`", "`", "code", onChange),
    },
  ];

  const listActions = [
    {
      label: "Liste à puces",
      icon: List,
      perform: (t: HTMLTextAreaElement) =>
        togglePrefix(t, value, "- ", onChange),
    },
    {
      label: "Liste numérotée",
      icon: ListOrdered,
      perform: (t: HTMLTextAreaElement) =>
        toggleOrderedList(t, value, onChange),
    },
    {
      label: "Liste de tâches",
      icon: ListChecks,
      perform: (t: HTMLTextAreaElement) =>
        togglePrefix(t, value, "- [ ] ", onChange),
    },
    {
      label: "Citation",
      icon: Quote,
      perform: (t: HTMLTextAreaElement) =>
        togglePrefix(t, value, "> ", onChange),
    },
  ];

  const insertActions = [
    {
      label: "Lien",
      icon: LinkIcon,
      perform: (t: HTMLTextAreaElement) => insertLink(t, value, onChange),
    },
    {
      label: "Bloc de code",
      icon: SquareCode,
      perform: (t: HTMLTextAreaElement) => toggleCodeBlock(t, value, onChange),
    },
    {
      label: "Tableau",
      icon: TableIcon,
      perform: (t: HTMLTextAreaElement) =>
        insertBlock(t, value, TABLE_TEMPLATE, onChange),
    },
    {
      label: "Ligne horizontale",
      icon: Minus,
      perform: (t: HTMLTextAreaElement) =>
        insertBlock(t, value, "---", onChange),
    },
  ];

  const headingLevels = [
    { level: 1, icon: Heading1, label: "Titre 1" },
    { level: 2, icon: Heading2, label: "Titre 2" },
    { level: 3, icon: Heading3, label: "Titre 3" },
    { level: 4, icon: Heading3, label: "Titre 4" },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Mise en forme Markdown"
      className={cn(
        "flex flex-wrap items-center gap-0.5 bg-card p-1 border rounded-md",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              title="Titre"
              className="gap-0.5 px-1.5 h-8"
            >
              <Heading2 className="w-4 h-4" />
              <ChevronDown className="opacity-60 w-3 h-3" />
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          {headingLevels.map(({ level, icon: Icon, label }) => (
            <DropdownMenuItem
              key={level}
              onClick={() =>
                withTextarea((t) => toggleHeading(t, value, level, onChange))
              }
            >
              <Icon className="mr-2 w-4 h-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mx-1 bg-border w-px h-5" aria-hidden="true" />

      {actions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="w-8 h-8"
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}

      <div className="mx-1 bg-border w-px h-5" aria-hidden="true" />

      {listActions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="w-8 h-8"
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}

      <div className="mx-1 bg-border w-px h-5" aria-hidden="true" />

      {insertActions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="w-8 h-8"
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
}
