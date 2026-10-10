import sharp from "sharp";

const MAX_EDGE: Record<string, number> = {
  hero: 2400,
  portrait: 1600,
  works: 2200,
  logo: 800,
  misc: 2000,
};

export async function optimizeImage(bytes: Buffer, folder: string) {
  const maxEdge = MAX_EDGE[folder] ?? 2000;
  const optimized = await sharp(bytes, { failOn: "none", animated: false })
    .rotate()
    .resize(maxEdge, maxEdge, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 76, effort: 4 })
    .toBuffer();

  return {
    bytes: optimized,
    contentType: "image/webp" as const,
    extension: ".webp" as const,
  };
}
