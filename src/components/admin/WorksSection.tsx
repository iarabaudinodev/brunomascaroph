"use client";

import { useState } from "react";
import { WORK_LAYOUTS } from "@/content/layouts";
import type { SiteConfig, WorkItem } from "@/content/types";
import { imageUrlsOf } from "@/lib/managed-images";
import { uniqueSlug } from "@/lib/slug";
import { deleteFiles, uploadFiles } from "@/lib/upload";
import { AdminButton, AdminField, FileDrop, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

function emptyWork(categories: SiteConfig["gallery"]["categories"]): WorkItem {
  const layout = WORK_LAYOUTS[0];
  const category =
    categories.find((item) => item.id !== "all")?.id ?? categories[0]?.id ?? "all";

  return {
    id: `obra-${Date.now()}`,
    title: "",
    meta: "",
    alt: "",
    src: "",
    category,
    span: layout.span,
    aspect: layout.aspect,
    className: layout.className || undefined,
    grayscale: false,
  };
}

export function WorksSection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(site);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchCategory, setBatchCategory] = useState("");
  const [batchMeta, setBatchMeta] = useState("");
  const { save, saving, message } = useSectionSave(onSaved, site);
  const assignable = draft.gallery.categories.filter((category) => category.id !== "all");

  async function addFromFiles(incoming: File[]) {
    const files = incoming.filter(Boolean);
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      const urls = await uploadFiles(files, "works");
      const taken = draft.gallery.works.map((work) => work.id);
      const created = urls.map((src, index) => {
        const name = files[index]?.name.replace(/\.[^.]+$/, "") ?? `Obra ${index + 1}`;
        const id = uniqueSlug(name, taken);
        taken.push(id);
        return {
          ...emptyWork(draft.gallery.categories),
          id,
          title: name,
          alt: name,
          src,
        };
      });
      setDraft({
        ...draft,
        gallery: { ...draft.gallery, works: [...draft.gallery.works, ...created] },
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudieron subir las fotos.");
    } finally {
      setUploading(false);
    }
  }

  function patch(id: string, partial: Partial<WorkItem>) {
    setDraft({
      ...draft,
      gallery: {
        ...draft.gallery,
        works: draft.gallery.works.map((work) =>
          work.id === id
            ? {
                ...work,
                ...partial,
                alt: partial.title !== undefined ? partial.title : work.alt,
              }
            : work,
        ),
      },
    });
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function applyBatch() {
    if (!selectedIds.length) return;
    const meta = batchMeta.trim();
    setDraft({
      ...draft,
      gallery: {
        ...draft.gallery,
        works: draft.gallery.works.map((work) =>
          selectedIds.includes(work.id)
            ? {
                ...work,
                ...(batchCategory ? { category: batchCategory } : {}),
                ...(meta ? { meta } : {}),
              }
            : work,
        ),
      },
    });
  }

  function remove(id: string) {
    const work = draft.gallery.works.find((item) => item.id === id);
    const next = {
      ...draft,
      gallery: {
        ...draft.gallery,
        works: draft.gallery.works.filter((item) => item.id !== id),
      },
    };
    setDraft(next);
    setSelectedIds((current) => current.filter((item) => item !== id));
    if (
      work?.src &&
      !imageUrlsOf(next).includes(work.src) &&
      !imageUrlsOf(site).includes(work.src)
    ) {
      void deleteFiles([work.src]).catch(() => {
        setUploadError("La obra se quitó, pero la imagen sigue en el almacenamiento.");
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          {draft.gallery.works.length} obras
        </span>
      </div>
      <FileDrop
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        disabled={uploading}
        idle="Arrastrá las fotos desde la carpeta o elegí archivos"
        busy="Subiendo…"
        onFiles={(files) => {
          void addFromFiles(files);
        }}
        onEmpty={() => setUploadError("Soltá fotos: jpg, png, webp, gif o avif.")}
      />
      {uploadError ? (
        <p className="font-label-sm text-label-sm text-error">{uploadError}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {draft.gallery.works.map((work) => (
          <article
            key={work.id}
            className="flex gap-4 border-b border-outline-variant/30 pb-4"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface-container-lowest">
              {work.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={work.src} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <label className="font-label-sm text-label-sm flex items-center gap-2 tracking-widest text-outline uppercase">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(work.id)}
                  onChange={() => toggleSelected(work.id)}
                />
                Incluir en el lote
              </label>
              <input
                className="field-input"
                aria-label="Nombre"
                value={work.title}
                onChange={(event) => patch(work.id, { title: event.target.value })}
              />
              <select
                className="field-input cursor-pointer appearance-none"
                aria-label="Categoría"
                value={work.category}
                onChange={(event) => patch(work.id, { category: event.target.value })}
              >
                {assignable.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-surface-container-high text-primary"
                  >
                    {category.label}
                  </option>
                ))}
              </select>
              <div>
                <AdminButton variant="danger" onClick={() => remove(work.id)}>
                  Eliminar
                </AdminButton>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-6 border border-outline-variant/40 p-5">
        <div>
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Editar por lote
          </p>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            Marcá las fotos y aplicales la misma categoría. El texto de abajo es
            opcional: aparece junto al nombre cuando se abre la foto. Sirve para
            una serie, un año o un lugar, por ejemplo «Buenos Aires, 2024». Si lo
            dejás vacío, no se modifica.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminButton
            variant="ghost"
            onClick={() => setSelectedIds(draft.gallery.works.map((work) => work.id))}
          >
            Todas
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => setSelectedIds([])}>
            Ninguna
          </AdminButton>
        </div>
        <AdminField label="Categoría del lote" htmlFor="batch-cat">
          <select
            id="batch-cat"
            className="field-input cursor-pointer appearance-none"
            value={batchCategory}
            onChange={(event) => setBatchCategory(event.target.value)}
          >
            <option value="" className="bg-surface-container-high text-primary">
              No cambiar
            </option>
            {assignable.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className="bg-surface-container-high text-primary"
              >
                {category.label}
              </option>
            ))}
          </select>
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
        <AdminButton onClick={applyBatch} disabled={!selectedIds.length}>
          Aplicar a {selectedIds.length || "las"} seleccionadas
        </AdminButton>
      </div>

      <SaveRow onSave={() => save(draft)} saving={saving} message={message} />
    </div>
  );
}
