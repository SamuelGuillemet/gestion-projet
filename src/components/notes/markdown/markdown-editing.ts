/** Low-level helpers shared by the markdown textarea and its formatting toolbar. */

export function insertUndoableText(
  textarea: HTMLTextAreaElement,
  text: string,
  selectionStart: number,
  selectionEnd: number,
  onChange: (value: string) => void,
) {
  textarea.focus();
  textarea.setSelectionRange(selectionStart, selectionEnd);

  if (document.execCommand("insertText", false, text)) {
    return;
  }

  textarea.setRangeText(text, selectionStart, selectionEnd, "end");
  textarea.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      data: text,
      inputType: "insertText",
    }),
  );
  onChange(textarea.value);
}

function getSelection(textarea: HTMLTextAreaElement, value: string) {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  return { start, end, selected: value.slice(start, end) };
}

function getLineRange(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIdx = value.indexOf("\n", end);
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
  return { lineStart, lineEnd };
}

/** Wraps the selection with `before`/`after` markers, or unwraps it if already wrapped. */
export function toggleWrap(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string,
  placeholder: string,
  onChange: (value: string) => void,
) {
  const { start, end, selected } = getSelection(textarea, value);

  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  ) {
    const unwrapped = selected.slice(
      before.length,
      selected.length - after.length,
    );
    insertUndoableText(textarea, unwrapped, start, end, onChange);
    textarea.setSelectionRange(start, start + unwrapped.length);
    return;
  }

  // Also unwrap when the selection sits just inside existing markers (e.g. right after formatting).
  if (
    value.slice(start - before.length, start) === before &&
    value.slice(end, end + after.length) === after
  ) {
    insertUndoableText(
      textarea,
      selected,
      start - before.length,
      end + after.length,
      onChange,
    );
    textarea.setSelectionRange(
      start - before.length,
      start - before.length + selected.length,
    );
    return;
  }

  const text = selected || placeholder;
  insertUndoableText(
    textarea,
    `${before}${text}${after}`,
    start,
    end,
    onChange,
  );
  textarea.setSelectionRange(
    start + before.length,
    start + before.length + text.length,
  );
}

/** Adds `prefix` to every selected line, or removes it if every line already has it. */
export function togglePrefix(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string,
  onChange: (value: string) => void,
) {
  const { start, end } = getSelection(textarea, value);
  const { lineStart, lineEnd } = getLineRange(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const allPrefixed = lines.every(
    (line) => line.length === 0 || line.startsWith(prefix),
  );

  const newLines = lines.map((line) => {
    if (line.length === 0) return line;
    if (allPrefixed) return line.slice(prefix.length);
    return line.startsWith(prefix) ? line : `${prefix}${line}`;
  });

  const newBlock = newLines.join("\n");
  insertUndoableText(textarea, newBlock, lineStart, lineEnd, onChange);
  textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
}

/** Toggles a Markdown heading level on every selected line. */
export function toggleHeading(
  textarea: HTMLTextAreaElement,
  value: string,
  level: number,
  onChange: (value: string) => void,
) {
  const prefix = `${"#".repeat(level)} `;
  const { start, end } = getSelection(textarea, value);
  const { lineStart, lineEnd } = getLineRange(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");

  const newLines = lines.map((line) => {
    const stripped = line.replace(/^#{1,6}\s+/, "");
    return line.startsWith(prefix) ? stripped : `${prefix}${stripped}`;
  });

  const newBlock = newLines.join("\n");
  insertUndoableText(textarea, newBlock, lineStart, lineEnd, onChange);
  textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
}

/** Toggles a numbered list on every selected line, renumbering as needed. */
export function toggleOrderedList(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (value: string) => void,
) {
  const { start, end } = getSelection(textarea, value);
  const { lineStart, lineEnd } = getLineRange(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const allOrdered = lines.every(
    (line) => line.length === 0 || /^\d+\.\s/.test(line),
  );

  let index = 0;
  const newLines = lines.map((line) => {
    if (line.length === 0) return line;
    if (allOrdered) return line.replace(/^\d+\.\s/, "");
    index += 1;
    return `${index}. ${line}`;
  });

  const newBlock = newLines.join("\n");
  insertUndoableText(textarea, newBlock, lineStart, lineEnd, onChange);
  textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
}

/** Wraps the selection in a fenced code block, adding surrounding newlines if needed. */
export function toggleCodeBlock(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (value: string) => void,
) {
  const { start, end, selected } = getSelection(textarea, value);
  const code = selected || "code";
  const leadingNewline = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const trailingNewline = end < value.length && value[end] !== "\n" ? "\n" : "";
  const block = `${leadingNewline}\`\`\`\n${code}\n\`\`\`${trailingNewline}`;

  insertUndoableText(textarea, block, start, end, onChange);
  const codeStart = start + leadingNewline.length + 4;
  textarea.setSelectionRange(codeStart, codeStart + code.length);
}

/** Inserts a link (or image) markdown snippet, selecting the URL placeholder. */
export function insertLink(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (value: string) => void,
) {
  const { start, end, selected } = getSelection(textarea, value);
  const label = selected || "texte du lien";
  const text = `[${label}](url)`;

  insertUndoableText(textarea, text, start, end, onChange);
  const urlStart = start + label.length + 3;
  textarea.setSelectionRange(urlStart, urlStart + 3);
}

/** Inserts a block of text on its own line(s), adding surrounding newlines if needed. */
export function insertBlock(
  textarea: HTMLTextAreaElement,
  value: string,
  block: string,
  onChange: (value: string) => void,
) {
  const { start, end } = getSelection(textarea, value);
  const leadingNewline = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const trailingNewline = end < value.length && value[end] !== "\n" ? "\n" : "";
  const text = `${leadingNewline}${block}${trailingNewline}`;

  insertUndoableText(textarea, text, start, end, onChange);
  const cursor = start + text.length;
  textarea.setSelectionRange(cursor, cursor);
}
