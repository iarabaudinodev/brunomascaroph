import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { isFirebaseConfigured } from "@/lib/firebase-app";
import { optimizeImage } from "@/lib/optimize-image";
import {
  deleteFromSupabase,
  isSupabaseConfigured,
  objectKeyFromUrl,
  uploadToSupabase,
} from "@/lib/supabase-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const FOLDERS = new Set(["hero", "portrait", "works", "logo", "misc"]);

function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}
const MAX_BYTES = 12 * 1024 * 1024;

async function isAuthorized(request: Request) {
  if (!isFirebaseConfigured()) return true;

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );

  return response.ok;
}

function uniqueName(extension: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
}

async function deleteLocalFiles(keys: string[]) {
  await Promise.all(
    keys.map(async (key) => {
      const root = path.resolve(process.cwd(), "public", "uploads");
      const full = path.resolve(root, key);
      if (full !== root && !full.startsWith(root + path.sep)) return;
      try {
        await unlink(full);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }),
  );
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const form = await request.formData();
    const folderRaw = String(form.get("folder") ?? "misc");
    const folder = FOLDERS.has(folderRaw) ? folderRaw : "misc";
    const incoming = form
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (!incoming.length) {
      const single = form.get("file");
      if (single instanceof File) incoming.push(single);
    }

    if (!incoming.length) {
      return Response.json({ error: "No se enviaron archivos." }, { status: 400 });
    }

    const urls: string[] = [];
    const useSupabase = isSupabaseConfigured();
    if (!useSupabase && process.env.VERCEL) {
      return Response.json(
        {
          error:
            "Faltan las variables de Supabase en el deploy (URL, anon y SUPABASE_SERVICE_ROLE_KEY).",
        },
        { status: 500 },
      );
    }

    const localDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!useSupabase) {
      await mkdir(localDir, { recursive: true });
    }

    for (const file of incoming) {
      const svg = isSvgFile(file);
      if (file.size > MAX_BYTES || (!svg && !ALLOWED_TYPES.has(file.type))) {
        return Response.json(
          { error: "Solo imágenes (jpg, png, webp, gif, avif o svg de logo) de hasta 12 MB." },
          { status: 400 },
        );
      }

      if (svg && folder !== "logo") {
        return Response.json({ error: "El SVG solo sirve para el logo." }, { status: 400 });
      }

      if (svg) {
        const bytes = Buffer.from(await file.arrayBuffer());
        const name = uniqueName(".svg");
        if (useSupabase) {
          urls.push(await uploadToSupabase(`${folder}/${name}`, bytes, "image/svg+xml"));
        } else {
          await writeFile(path.join(localDir, name), bytes);
          urls.push(`/uploads/${folder}/${name}`);
        }
        continue;
      }

      const original = Buffer.from(await file.arrayBuffer());
      let optimized: Awaited<ReturnType<typeof optimizeImage>>;
      try {
        optimized = await optimizeImage(original, folder);
      } catch {
        return Response.json(
          { error: "No se pudo optimizar la imagen. Probá con otro archivo." },
          { status: 400 },
        );
      }

      const name = uniqueName(optimized.extension);

      if (useSupabase) {
        urls.push(
          await uploadToSupabase(
            `${folder}/${name}`,
            optimized.bytes,
            optimized.contentType,
          ),
        );
      } else {
        await writeFile(path.join(localDir, name), optimized.bytes);
        urls.push(`/uploads/${folder}/${name}`);
      }
    }

    return Response.json({ urls, url: urls[0] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const payload = (await request.json()) as { urls?: unknown };
    const urls = Array.isArray(payload.urls)
      ? payload.urls.filter((item): item is string => typeof item === "string")
      : [];
    const keys = [
      ...new Set(urls.map(objectKeyFromUrl).filter(Boolean)),
    ] as string[];

    if (!keys.length || keys.length !== urls.length) {
      return Response.json(
        { error: "No se pudo identificar una imagen para borrarla del almacenamiento." },
        { status: 400 },
      );
    }

    if (isSupabaseConfigured()) {
      await deleteFromSupabase(keys);
    } else if (process.env.VERCEL) {
      return Response.json(
        { error: "Faltan las variables de Supabase en el deploy." },
        { status: 500 },
      );
    } else {
      await deleteLocalFiles(keys);
    }

    return Response.json({ ok: true, deleted: keys.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo borrar la imagen.";
    return Response.json({ error: message }, { status: 500 });
  }
}
