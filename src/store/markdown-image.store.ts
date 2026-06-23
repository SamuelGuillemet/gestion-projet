import { createStore, del, get, keys, set } from "idb-keyval";
import {
  collectMarkdownImageIds,
  createMarkdownImageUri,
  getMarkdownImageId,
} from "@/lib/markdown-images";

const MARKDOWN_IMAGE_DB_NAME = "gestion-projet-assets";
const MARKDOWN_IMAGE_STORE_NAME = "markdown-images";

const markdownImageStore = createStore(
  MARKDOWN_IMAGE_DB_NAME,
  MARKDOWN_IMAGE_STORE_NAME,
);

export async function saveMarkdownImage(file: Blob) {
  const id = crypto.randomUUID().toLowerCase();
  await set(id, file, markdownImageStore);
  return createMarkdownImageUri(id);
}

export async function getMarkdownImageBlob(uri: string) {
  const id = getMarkdownImageId(uri);
  if (!id) return null;

  const image = await get<Blob>(id, markdownImageStore);
  return image ?? null;
}

export async function cleanupMarkdownImages(
  markdownContents: Iterable<string>,
) {
  const referencedIds = collectMarkdownImageIds(markdownContents);
  const storedKeys = await keys(markdownImageStore);

  await Promise.all(
    storedKeys.flatMap((storedKey) => {
      if (typeof storedKey !== "string") return [];
      if (referencedIds.has(storedKey.toLowerCase())) return [];
      return del(storedKey, markdownImageStore);
    }),
  );
}
