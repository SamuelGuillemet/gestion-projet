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
  Palette,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  insertBlock,
  insertLink,
  setTextColor,
  toggleCodeBlock,
  toggleHeading,
  toggleOrderedList,
  togglePrefix,
  toggleWrap,
} from "./markdown-editing";
import { getTextColorClassName, TEXT_COLORS } from "./plugins/rehype-text-color";

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const TABLE_TEMPLATE = "| Colonne 1 | Colonne 2 |\n| --- | --- |\n| Valeur 1 | Valeur 2 |";

export function MarkdownToolbar({ textareaRef, value, onChange, className }: Props) {
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
      perform: (t: HTMLTextAreaElement) => toggleWrap(t, value, "`", "`", "code", onChange),
    },
  ];

  const listActions = [
    {
      label: "Liste à puces",
      icon: List,
      perform: (t: HTMLTextAreaElement) => togglePrefix(t, value, "- ", onChange),
    },
    {
      label: "Liste numérotée",
      icon: ListOrdered,
      perform: (t: HTMLTextAreaElement) => toggleOrderedList(t, value, onChange),
    },
    {
      label: "Liste de tâches",
      icon: ListChecks,
      perform: (t: HTMLTextAreaElement) => togglePrefix(t, value, "- [ ] ", onChange),
    },
    {
      label: "Citation",
      icon: Quote,
      perform: (t: HTMLTextAreaElement) => togglePrefix(t, value, "> ", onChange),
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
      perform: (t: HTMLTextAreaElement) => insertBlock(t, value, TABLE_TEMPLATE, onChange),
    },
    {
      label: "Ligne horizontale",
      icon: Minus,
      perform: (t: HTMLTextAreaElement) => insertBlock(t, value, "---", onChange),
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
      className={cn("flex flex-wrap items-center gap-0.5 rounded-md border bg-card p-1", className)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" title="Titre" className="h-8 gap-0.5 px-1.5">
              <Heading2 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          {headingLevels.map(({ level, icon: Icon, label }) => (
            <DropdownMenuItem
              key={level}
              onClick={() => withTextarea((t) => toggleHeading(t, value, level, onChange))}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      {actions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="h-8 w-8"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              title="Couleur du texte"
              className="h-8 gap-0.5 px-1.5"
            >
              <Palette className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="min-w-36">
          {TEXT_COLORS.map((color) => (
            <DropdownMenuItem
              key={color.id}
              onClick={() =>
                withTextarea((textarea) => setTextColor(textarea, value, color.id, onChange))
              }
            >
              <span
                aria-hidden="true"
                className={cn("size-3 rounded-full bg-current", getTextColorClassName(color.id))}
              />
              <span>{color.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              withTextarea((textarea) => setTextColor(textarea, value, null, onChange))
            }
          >
            <span aria-hidden="true" className="size-3 rounded-full border border-foreground/50" />
            <span>Sans couleur</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      {listActions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="h-8 w-8"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

      {insertActions.map(({ label, icon: Icon, perform }) => (
        <Button
          key={label}
          size="icon"
          variant="ghost"
          title={label}
          onClick={() => withTextarea(perform)}
          className="h-8 w-8"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
