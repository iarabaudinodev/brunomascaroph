function matchesAccept(file: File, accept: string) {
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return file.type.startsWith("image/") || isImageName(file.name);

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return tokens.some((token) => {
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    if (token.startsWith(".")) return name.endsWith(token);
    if (type === token) return true;
    if (!type && token.startsWith("image/")) return extensionMatches(name, token);
    return false;
  });
}

function isImageName(name: string) {
  return /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(name);
}

function extensionMatches(name: string, mime: string) {
  const ext = name.match(/\.([a-z0-9]+)$/i)?.[1];
  if (!ext) return false;
  if (mime === "image/jpeg") return ext === "jpg" || ext === "jpeg";
  if (mime === "image/svg+xml") return ext === "svg";
  return mime === `image/${ext}`;
}

function fileFromEntry(entry: FileSystemFileEntry) {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function readDirectory(entry: FileSystemDirectoryEntry) {
  return new Promise<FileSystemEntry[]>((resolve, reject) => {
    const reader = entry.createReader();
    const all: FileSystemEntry[] = [];
    const read = () => {
      reader.readEntries((batch) => {
        if (!batch.length) {
          resolve(all);
          return;
        }
        all.push(...batch);
        read();
      }, reject);
    };
    read();
  });
}

async function collect(
  entry: FileSystemEntry,
  push: (file: File) => void,
  depth: number,
) {
  if (depth > 4) return;
  if (entry.isFile) {
    push(await fileFromEntry(entry as FileSystemFileEntry));
    return;
  }
  if (!entry.isDirectory) return;
  const children = await readDirectory(entry as FileSystemDirectoryEntry);
  for (const child of children) await collect(child, push, depth + 1);
}

/**
 * Devuelve los archivos soltados que cumplen `accept`.
 * Los archivos sueltos se leen directo del evento; la API de entries
 * (webkitGetAsEntry) se usa solo para recorrer carpetas, porque leer
 * archivos a través de ella falla en silencio en algunos navegadores.
 * Debe llamarse de forma sincrónica dentro del handler de drop.
 */
export async function filesFromDrop(data: DataTransfer | null, accept: string) {
  if (!data) return [];

  const found: File[] = [];
  const seen = new Set<string>();
  const push = (file: File) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (matchesAccept(file, accept)) found.push(file);
  };

  const directories: FileSystemDirectoryEntry[] = [];
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== "file") continue;
    const entry = item.webkitGetAsEntry?.() ?? null;
    if (entry?.isDirectory) {
      directories.push(entry as FileSystemDirectoryEntry);
      continue;
    }
    const file = item.getAsFile();
    if (file) push(file);
  }

  // Navegadores sin DataTransferItemList o que solo exponen `files`.
  if (!found.length && !directories.length) {
    Array.from(data.files ?? []).forEach(push);
  }

  for (const directory of directories) {
    try {
      await collect(directory, push, 0);
    } catch {
      // Una carpeta ilegible no debe anular los archivos que sí se pudieron leer.
    }
  }

  return found;
}
