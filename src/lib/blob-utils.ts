import { getMarkdownImageBlob } from "@/store/markdown-image.store";

export async function resolveImageSourceAsDataUrl(src: string) {
  if (!src || src.startsWith("data:")) return src;

  const idbBlob = await getMarkdownImageBlob(src);
  if (idbBlob) {
    return blobToDataUrl(idbBlob);
  }

  try {
    const response = await fetch(src);
    if (!response.ok) return src;
    const blob = await response.blob();
    return blobToDataUrl(blob);
  } catch {
    return src;
  }
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to convert blob to data URL."));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getSvgDimensions(svg: SVGSVGElement) {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox?.width && viewBox?.height) {
    return {
      width: Math.round(viewBox.width),
      height: Math.round(viewBox.height),
    };
  }

  const parseNumericSize = (value: string | null) => {
    if (!value) return 0;

    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const attrWidth = parseNumericSize(svg.getAttribute("width"));
  const attrHeight = parseNumericSize(svg.getAttribute("height"));
  if (attrWidth > 0 && attrHeight > 0) {
    return {
      width: Math.round(attrWidth),
      height: Math.round(attrHeight),
    };
  }

  return { width: 1200, height: 700 };
}

export async function svgStringToPngDataUrl(svgSource: string) {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(svgSource, "image/svg+xml");
  const svg = parsedDocument.querySelector("svg");

  if (!svg) {
    throw new Error("Unable to parse SVG output.");
  }

  const { width, height } = getSvgDimensions(svg);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to initialize canvas context.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(scale, scale);

  const svgBlob = new Blob([svgSource], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.decoding = "sync";
      image.onload = () => {
        context.drawImage(image, 0, 0, width, height);
        resolve();
      };
      image.onerror = () => reject(new Error("Unable to load SVG image."));
      image.src = svgUrl;
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }

  return canvas.toDataURL("image/png");
}
