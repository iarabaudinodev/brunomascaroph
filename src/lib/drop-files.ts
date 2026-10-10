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

async function collect(entry: FileSystemEntry, accept: string, found: File[], depth: number) {
  if (depth > 4) return;
  if (entry.isFile) {
    const file = await fileFromEntry(entry as FileSystemFileEntry);
    if (matchesAccept(file, accept)) found.push(file);
    return;
  }
  if (!entry.isDirectory) return;
  const children = await readDirectory(entry as FileSystemDirectoryEntry);
  for (const child of children) await collect(child, accept, found, depth + 1);
}

export async function filesFromDrop(data: DataTransfer | null, accept: string) {
  if (!data) return [];

  const entries = Array.from(data.items)
    .map((item) => item.webkitGetAsEntry?.() ?? null)
    .filter((entry): entry is FileSystemEntry => Boolean(entry));

  if (entries.length) {
    const found: File[] = [];
    for (const entry of entries) await collect(entry, accept, found, 0);
    return found;
  }

  return Array.from(data.files).filter((file) => matchesAccept(file, accept));
}
