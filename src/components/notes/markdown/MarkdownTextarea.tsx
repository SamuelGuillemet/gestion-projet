import { ImagePlus } from "lucide-react";
import {
  type ClipboardEvent,
  type DragEvent,
  type TextareaHTMLAttributes,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { escapeMarkdownImageAlt } from "@/lib/markdown-images";
import { cn } from "@/lib/utils";
import { saveMarkdownImage } from "@/store/markdown-image.store";

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
};

function buildMarkdownImage(uri: string, fileName: string) {
  const alt = escapeMarkdownImageAlt(fileName.replace(/\.[^.]+$/, ""));
  return `![${alt}](${uri})`;
}

function extractImageFiles(items: Iterable<DataTransferItem>) {
  const files: File[] = [];

  for (const item of items) {
    if (item.kind !== "file") continue;

    const file = item.getAsFile();
    if (file?.type.startsWith("image/")) files.push(file);
  }

  return files;
}

function extractDroppedImageFiles(files: Iterable<File>) {
  return [...files].filter((file) => file.type.startsWith("image/"));
}

export function MarkdownTextarea({
  className,
  onChange,
  value,
  ...props
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const insertMarkdown = async (files: File[]) => {
    if (files.length === 0) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea?.selectionStart ?? value.length;
    const selectionEnd = textarea?.selectionEnd ?? value.length;

    const fragments = await Promise.all(
      files.map(async (file) => {
        const uri = await saveMarkdownImage(file);
        return buildMarkdownImage(uri, file.name);
      }),
    );

    const insertedText = fragments.join("\n");
    const nextValue =
      value.slice(0, selectionStart) + insertedText + value.slice(selectionEnd);

    onChange(nextValue);

    requestAnimationFrame(() => {
      if (!textarea) return;
      const nextSelection = selectionStart + insertedText.length;
      textarea.focus();
      textarea.setSelectionRange(nextSelection, nextSelection);
    });
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = extractImageFiles(event.clipboardData.items);
    if (imageFiles.length === 0) return;

    event.preventDefault();
    await insertMarkdown(imageFiles);
  };

  const handleDrop = async (event: DragEvent<HTMLTextAreaElement>) => {
    const imageFiles = extractDroppedImageFiles(event.dataTransfer.files);
    setIsDragging(false);

    if (imageFiles.length === 0) return;

    event.preventDefault();
    await insertMarkdown(imageFiles);
  };

  const handleDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
    const hasImageFile = [...event.dataTransfer.items].some(
      (item) => item.kind === "file" && item.type.startsWith("image/"),
    );

    if (!hasImageFile) return;

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLTextAreaElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null))
      return;
    setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      const nextValue =
        value.slice(0, selectionStart) + "\t" + value.slice(selectionEnd);

      onChange(nextValue);

      requestAnimationFrame(() => {
        const nextSelection = selectionStart + 1;
        textarea.focus();
        textarea.setSelectionRange(nextSelection, nextSelection);
      });
    }
  };

  return (
    <div className="relative flex flex-1 min-h-0 flex-col gap-2">
      <Textarea
        {...props}
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 min-h-0 font-mono text-sm resize-none transition-colors",
          isDragging && "border-primary bg-primary/5",
          className,
        )}
      />

      {isDragging ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-dashed border-primary bg-background/85 text-primary backdrop-blur-[1px] pointer-events-none">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ImagePlus className="h-4 w-4" />
            Déposez l'image pour l'ajouter à la note
          </div>
        </div>
      ) : null}
    </div>
  );
}
