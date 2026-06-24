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

export interface ExportedMarkdownImageAsset {
  id: string;
  mimeType: string;
  base64: string;
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

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

export async function exportMarkdownImageAssets() {
  const storedKeys = await keys(markdownImageStore);
  const storedIds = storedKeys.flatMap((storedKey) =>
    typeof storedKey === "string" ? [storedKey] : [],
  );

  const assets = await Promise.all(
    storedIds.map(async (id) => {
      const blob = await get<Blob>(id, markdownImageStore);
      if (!blob) return null;

      return {
        id,
        mimeType: blob.type || "application/octet-stream",
        base64: await blobToBase64(blob),
      } satisfies ExportedMarkdownImageAsset;
    }),
  );

  return assets.filter((asset) => asset !== null);
}

export async function importMarkdownImageAssets(
  assets: readonly ExportedMarkdownImageAsset[],
) {
  await Promise.all(
    assets.map(async (asset) => {
      if (!asset.base64) return;

      const blob = base64ToBlob(asset.base64, asset.mimeType);
      await set(asset.id, blob, markdownImageStore);
    }),
  );
}
