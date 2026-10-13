"use client";

import { useEffect, useRef, useState } from "react";
import { WORK_LAYOUTS } from "@/content/layouts";
import type { GalleryCategory, SiteConfig, WorkItem } from "@/content/types";
import { uniqueSlug } from "@/lib/slug";
import { deleteFiles, uploadFiles } from "@/lib/upload";
import { cn } from "@/lib/cn";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, AdminSelect, FileDrop, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

type Pending = {
  id: string;
  title: string;
  src: string;
};

function assignableOf(categories: GalleryCategory[]) {
  return categories.filter((category) => category.id !== "all");
}

export function UploadImagesSection({
  site,
  onSaved,
  onGoToEdit,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
  onGoToEdit: () => void;
}) {
  const [categories, setCategories] = useState(site.gallery.categories);
  const [newCategory, setNewCategory] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [batchCategory, setBatchCategory] = useState(
    () => assignableOf(site.gallery.categories)[0]?.id ?? "",
  );
  const [batchMeta, setBatchMeta] = useState("");
  const [lastSavedCount, setLastSavedCount] = useState(0);
  const { save, saving, message } = useSectionSave(onSaved, site);

  const assignable = assignableOf(categories);
  const categoriesChanged = !isSameContent(categories, site.gallery.categories);
  const dirty = categoriesChanged || pending.length > 0;
  useUnsavedChanges(dirty);

  // Si el usuario se va con fotos subidas pero sin guardar, se borran del almacenamiento.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => {
    return () => {
      const orphaned = pendingRef.current.map((item) => item.src);
      if (orphaned.length) void deleteFiles(orphaned).catch(() => {});
    };
  }, []);

  function addCategory() {
    const label = newCategory.trim();
    if (!label) return;
    const id = uniqueSlug(
      label,
      categories.map((category) => category.id),
    );
    if (id === "all") return;
    setCategories([...categories, { id, label }]);
    setNewCategory("");
    setError("");
    setBatchCategory(id);
  }

  async function addFromFiles(incoming: File[]) {
    const files = incoming.filter(Boolean);
    if (!files.length) return;
    setUploading(true);
    setError("");
    setLastSavedCount(0);
    try {
      const urls = await uploadFiles(files, "works");
      const taken = [
        ...site.gallery.works.map((work) => work.id),
        ...pending.map((item) => item.id),
      ];
      const created = urls.map((src, index) => {
        const name =
          files[index]?.name.replace(/\.[^.]+$/, "") ?? `Imagen ${index + 1}`;
        const id = uniqueSlug(name, taken);
        taken.push(id);
        return { id, title: name, src };
      });
      setPending((current) => [...current, ...created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron subir las imágenes.");
    } finally {
      setUploading(false);
    }
  }

  function rename(id: string, title: string) {
    setPending((current) =>
      current.map((item) => (item.id === id ? { ...item, title } : item)),
    );
  }

  function removePending(id: string) {
    const item = pending.find((entry) => entry.id === id);
    setPending((current) => current.filter((entry) => entry.id !== id));
    if (item?.src) {
      void deleteFiles([item.src]).catch(() => {
        setError("La imagen se quitó, pero el archivo sigue en el almacenamiento.");
      });
    }
  }

  async function onSave() {
    if (pending.length && !batchCategory) {
      setError("Elegí una categoría para las imágenes antes de guardar.");
      return;
    }
    setError("");
    const layout = WORK_LAYOUTS[0];
    const meta = batchMeta.trim();
    const works: WorkItem[] = pending.map((item) => ({
      id: item.id,
      title: item.title.trim() || "Sin título",
      meta,
      alt: item.title.trim() || "Imagen",
      src: item.src,
      category: batchCategory,
      span: layout.span,
      aspect: layout.aspect,
      className: layout.className || undefined,
      grayscale: false,
    }));
    const count = works.length;
    const saved = await save({
      ...site,
      gallery: {
        ...site.gallery,
        categories,
        works: [...site.gallery.works, ...works],
      },
    });
    if (saved) {
      setPending([]);
      setBatchMeta("");
      setLastSavedCount(count);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            1 · Categorías
          </p>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            Tocá la categoría a la que van las imágenes que vas a subir, o creá
            una nueva. Para renombrarlas o eliminarlas, usá Editar imágenes.
          </p>
        </div>
        {assignable.length ? (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoría">
            {assignable.map((category) => {
              const active = category.id === batchCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setBatchCategory(category.id)}
                  className={cn(
                    "font-label-sm text-label-sm cursor-pointer border px-3 py-1.5 tracking-widest uppercase transition-colors",
                    active
                      ? "border-primary bg-primary text-surface"
                      : "border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary",
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Todavía no hay categorías
          </p>
        )}
        <div className="flex items-end gap-4">
          <AdminField label="Nueva categoría" htmlFor="new-cat">
            <input
              id="new-cat"
              className="field-input"
              value={newCategory}
              placeholder="Quinces, Bodas, Retratos…"
              onChange={(event) => setNewCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCategory();
                }
              }}
            />
          </AdminField>
          <AdminButton variant="ghost" onClick={addCategory}>
            + Crear
          </AdminButton>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          2 · Subir imágenes
        </p>
        <FileDrop
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          disabled={uploading}
          idle="Arrastrá las imágenes desde la carpeta o elegí archivos"
          busy="Subiendo…"
          onFiles={(files) => {
            void addFromFiles(files);
          }}
          onEmpty={() => setError("Soltá imágenes: jpg, png, webp, gif o avif.")}
        />
        {pending.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pending.map((item) => (
              <article
                key={item.id}
                className="flex gap-4 border-b border-outline-variant/30 pb-4"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface-container-lowest">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    className="field-input"
                    aria-label="Nombre"
                    value={item.title}
                    onChange={(event) => rename(item.id, event.target.value)}
                  />
                  <div>
                    <AdminButton variant="danger" onClick={() => removePending(item.id)}>
                      Quitar
                    </AdminButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {!pending.length && lastSavedCount ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Se guardaron {lastSavedCount} imágenes. Podés verlas y ajustarlas en
              Editar imágenes.
            </p>
            {!dirty ? (
              <AdminButton variant="ghost" onClick={onGoToEdit}>
                Ir a Editar imágenes →
              </AdminButton>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            3 · Datos de estas imágenes
          </p>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            Se aplican a todas las imágenes que acabás de subir. El texto es
            opcional y aparece junto al nombre al abrir la foto, por ejemplo
            «Buenos Aires, 2024».
          </p>
        </div>
        <AdminField label="Categoría" htmlFor="batch-cat">
          <AdminSelect
            id="batch-cat"
            value={batchCategory}
            disabled={!assignable.length}
            onChange={(event) => setBatchCategory(event.target.value)}
          >
            {!assignable.length ? (
              <option value="" className="bg-surface-container-high text-primary">
                Primero creá una categoría
              </option>
            ) : null}
            {assignable.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className="bg-surface-container-high text-primary"
              >
                {category.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="Texto al abrir la foto" htmlFor="batch-meta">
          <input
            id="batch-meta"
            className="field-input"
            value={batchMeta}
            placeholder="Buenos Aires, 2024"
            onChange={(event) => setBatchMeta(event.target.value)}
          />
        </AdminField>
      </section>

      {error ? <p className="font-label-sm text-label-sm text-error">{error}</p> : null}

      <SaveRow
        onSave={() => {
          void onSave();
        }}
        saving={saving}
        disabled={!dirty}
        message={
          message ||
          (pending.length
            ? `${pending.length} ${pending.length === 1 ? "imagen lista" : "imágenes listas"} para guardar`
            : "")
        }
      />
    </div>
  );
}
