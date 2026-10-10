export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function supabaseBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "uploads";
}

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
}

function supabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

const OBJECT_KEY = /^(hero|portrait|works|logo|misc)\/[A-Za-z0-9._-]+$/;

export function objectKeyFromUrl(fileUrl: string) {
  const clean = fileUrl.split("?")[0];
  const url = supabaseUrl();
  const bucket = supabaseBucket();

  if (url) {
    const prefix = `${url}/storage/v1/object/public/${bucket}/`;
    if (clean.startsWith(prefix)) {
      const key = decodeURIComponent(clean.slice(prefix.length));
      return OBJECT_KEY.test(key) ? key : null;
    }
  }

  const local = clean.match(
    /^\/uploads\/((?:hero|portrait|works|logo|misc)\/[A-Za-z0-9._-]+)$/,
  );
  return local?.[1] ?? null;
}

export async function uploadToSupabase(
  pathName: string,
  bytes: Buffer,
  contentType: string,
) {
  const url = supabaseUrl();
  const key = supabaseKey();
  const bucket = supabaseBucket();

  if (!url || !key) {
    throw new Error("Supabase no está configurado.");
  }

  const endpoint = `${url}/storage/v1/object/${bucket}/${pathName}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: new Uint8Array(bytes),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "No se pudo subir a Supabase.");
  }

  return `${url}/storage/v1/object/public/${bucket}/${pathName}`;
}

export async function deleteFromSupabase(pathNames: string[]) {
  const unique = [...new Set(pathNames.filter((key) => OBJECT_KEY.test(key)))];
  if (!unique.length) return;

  const url = supabaseUrl();
  const key = supabaseKey();
  const bucket = supabaseBucket();

  if (!url || !key) {
    throw new Error("Supabase no está configurado.");
  }

  const response = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: unique }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "No se pudo borrar en Supabase.");
  }
}
