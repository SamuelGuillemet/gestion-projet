import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getMarkdownImageBlob } from "@/store/markdown-image.store";

type CachedImage = {
  objectUrl: string | null;
  promise: Promise<string | null> | null;
};

const cachedImages = new Map<string, CachedImage>();

function getCachedObjectUrl(src: string) {
  return cachedImages.get(src)?.objectUrl ?? null;
}

function loadCachedImage(src: string) {
  const cachedImage = cachedImages.get(src);
  if (cachedImage) return cachedImage;

  const nextCachedImage: CachedImage = {
    objectUrl: null,
    promise: null,
  };

  nextCachedImage.promise = getMarkdownImageBlob(src)
    .then((blob) => {
      if (!blob) {
        cachedImages.delete(src);
        return null;
      }

      const objectUrl = URL.createObjectURL(blob);
      nextCachedImage.objectUrl = objectUrl;
      return objectUrl;
    })
    .catch(() => {
      cachedImages.delete(src);
      return null;
    })
    .finally(() => {
      nextCachedImage.promise = null;
    });

  cachedImages.set(src, nextCachedImage);
  return nextCachedImage;
}

export function IdbImage({
  alt,
  className,
  src,
  ...props
}: ComponentPropsWithoutRef<"img"> & { src: string }) {
  const [loadedImage, setLoadedImage] = useState<{
    src: string;
    objectUrl: string | null;
  } | null>(null);
  const resolvedSrc =
    getCachedObjectUrl(src) ??
    (loadedImage?.src === src ? loadedImage.objectUrl : null);

  useEffect(() => {
    let isDisposed = false;
    const cachedImage = loadCachedImage(src);

    if (!cachedImage.promise) return;

    void cachedImage.promise.then((objectUrl) => {
      if (isDisposed) return;
      setLoadedImage({ src, objectUrl });
    });

    return () => {
      isDisposed = true;
    };
  }, [src]);

  if (!resolvedSrc) {
    return (
      <span className="inline-flex justify-center px-3 py-2 border border-dashed rounded-md w-full text-muted-foreground text-sm">
        Image indisponible {src}
      </span>
    );
  }

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      className={cn("my-2 border rounded-xl object-contain", className)}
    />
  );
}
