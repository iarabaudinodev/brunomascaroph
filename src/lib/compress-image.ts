const MAX_EDGE: Record<string, number> = {
  hero: 2400,
  portrait: 1600,
  works: 2200,
  logo: 800,
  misc: 2000,
};

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

export async function compressImageFile(file: File, folder: string) {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg")
  ) {
    return file;
  }

  const maxEdge = MAX_EDGE[folder] ?? 2000;
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);

    if (folder === "logo") {
      const logoWebp = await canvasToBlob(canvas, "image/webp", 0.92);
      if (!logoWebp) return file;
      const logoName = file.name.replace(/\.[^.]+$/, "") + ".webp";
      return new File([logoWebp], logoName, { type: "image/webp" });
    }

    const webp = await canvasToBlob(canvas, "image/webp", 0.76);
    const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.82);
    const blob =
      webp && (!jpeg || webp.size <= jpeg.size) ? webp : jpeg;

    if (!blob) return file;

    const type = blob.type || "image/jpeg";
    const extension = type === "image/webp" ? ".webp" : ".jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + extension;
    const compressed = new File([blob], name, { type });

    if (compressed.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        "La imagen sigue siendo demasiado pesada después de comprimirla.",
      );
    }

    return compressed;
  } finally {
    bitmap.close();
  }
}
