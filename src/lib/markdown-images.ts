const MARKDOWN_IMAGE_SCHEME = "idb://";
const MARKDOWN_IMAGE_ID_PATTERN =
  /idb:\/\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/gi;

export function createMarkdownImageUri(id: string) {
  return `${MARKDOWN_IMAGE_SCHEME}${id}`;
}

export function isMarkdownImageUri(value: string) {
  return value.startsWith(MARKDOWN_IMAGE_SCHEME);
}

export function getMarkdownImageId(value: string) {
  if (!isMarkdownImageUri(value)) return null;

  const id = value.slice(MARKDOWN_IMAGE_SCHEME.length).trim();
  return id.length > 0 ? id : null;
}

export function collectMarkdownImageIds(markdownContents: Iterable<string>) {
  const ids = new Set<string>();

  for (const content of markdownContents) {
    for (const match of content.matchAll(MARKDOWN_IMAGE_ID_PATTERN)) {
      const id = match[1]?.toLowerCase();
      if (id) ids.add(id);
    }
  }

  return ids;
}

export function escapeMarkdownImageAlt(value: string) {
  return value.replaceAll(/[[\]]/g, "").trim() || "Image";
}
