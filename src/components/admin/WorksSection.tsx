"use client";

import { useState } from "react";
import { layoutFromWork, WORK_LAYOUTS } from "@/content/layouts";
import type { SiteConfig, WorkItem } from "@/content/types";
import { imageUrlsOf } from "@/lib/managed-images";
import { uniqueSlug } from "@/lib/slug";
import { deleteFiles, uploadFiles } from "@/lib/upload";
import { AdminButton, AdminField, FileDrop, ImageField, SaveRow } from "./fields";
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
  const [editing, setEditing] = useState<WorkItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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

  function upsert(work: WorkItem) {
    const exists = draft.gallery.works.some((item) => item.id === work.id);
    const works = exists
      ? draft.gallery.works.map((item) => (item.id === work.id ? work : item))
      : [...draft.gallery.works, work];
    setDraft({ ...draft, gallery: { ...draft.gallery, works } });
    setEditing(null);
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
    if (editing?.id === id) setEditing(null);
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
        <AdminButton variant="ghost" onClick={() => setEditing(emptyWork(draft.gallery.categories))}>
          + Nueva obra
        </AdminButton>
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
            <div className="min-w-0 flex-1">
              <p className="font-body-md text-body-md text-primary">
                {work.title || "Sin título"}
              </p>
              <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
                {draft.gallery.categories.find((category) => category.id === work.category)
                  ?.label ?? work.category}
              </p>
              <div className="mt-2 flex gap-3">
                <AdminButton variant="ghost" onClick={() => setEditing(work)}>
                  Editar
                </AdminButton>
                <AdminButton variant="danger" onClick={() => remove(work.id)}>
                  Eliminar
                </AdminButton>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <WorkEditor
          work={editing}
          categories={assignable}
          onCancel={() => setEditing(null)}
          onSave={(work) => {
            const id =
              work.title && work.id.startsWith("obra-")
                ? uniqueSlug(
                    work.title,
                    draft.gallery.works
                      .filter((item) => item.id !== work.id)
                      .map((item) => item.id),
                  )
                : work.id;
            upsert({ ...work, id, alt: work.alt || work.title });
          }}
        />
      ) : null}

      <SaveRow onSave={() => save(draft)} saving={saving} message={message} />
    </div>
  );
}

function WorkEditor({
  work,
  categories,
  onSave,
  onCancel,
}: {
  work: WorkItem;
  categories: SiteConfig["gallery"]["categories"];
  onSave: (work: WorkItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(work);
  const layoutId = layoutFromWork(draft.span, draft.aspect);

  function applyLayout(id: string) {
    const layout = WORK_LAYOUTS.find((item) => item.id === id) ?? WORK_LAYOUTS[0];
    setDraft({
      ...draft,
      span: layout.span,
      aspect: layout.aspect,
      className: layout.className || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6 bg-surface-container-low p-6">
      <AdminField label="Título" htmlFor="work-title">
        <input
          id="work-title"
          className="field-input"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </AdminField>
      <AdminField label="Meta (serie, medio, lugar)" htmlFor="work-meta">
        <input
          id="work-meta"
          className="field-input"
          value={draft.meta}
          onChange={(event) => setDraft({ ...draft, meta: event.target.value })}
        />
      </AdminField>
      <ImageField
        label="Imagen"
        value={draft.src}
        folder="works"
        retainUrl={work.src}
        onChange={(src) => setDraft({ ...draft, src })}
      />
      <AdminField label="Texto alternativo" htmlFor="work-alt">
        <input
          id="work-alt"
          className="field-input"
          value={draft.alt}
          onChange={(event) => setDraft({ ...draft, alt: event.target.value })}
        />
      </AdminField>
      <AdminField label="Categoría" htmlFor="work-cat">
        <select
          id="work-cat"
          className="field-input cursor-pointer appearance-none"
          value={draft.category}
          onChange={(event) => setDraft({ ...draft, category: event.target.value })}
        >
          {categories.map((category) => (
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
      <AdminField label="Formato en la grilla" htmlFor="work-layout">
        <select
          id="work-layout"
          className="field-input cursor-pointer appearance-none"
          value={layoutId}
          onChange={(event) => applyLayout(event.target.value)}
        >
          {WORK_LAYOUTS.map((layout) => (
            <option
              key={layout.id}
              value={layout.id}
              className="bg-surface-container-high text-primary"
            >
              {layout.label}
            </option>
          ))}
        </select>
      </AdminField>
      <label className="font-label-sm text-label-sm flex items-center gap-3 tracking-widest text-on-surface-variant uppercase">
        <input
          type="checkbox"
          checked={Boolean(draft.grayscale)}
          onChange={(event) =>
            setDraft({ ...draft, grayscale: event.target.checked })
          }
        />
        Blanco y negro
      </label>
      <div className="flex items-center gap-4">
        <AdminButton onClick={() => onSave(draft)}>Listo</AdminButton>
        <AdminButton
          variant="ghost"
          onClick={() => {
            if (draft.src && draft.src !== work.src) {
              void deleteFiles([draft.src]);
            }
            onCancel();
          }}
        >
          Cancelar
        </AdminButton>
      </div>
    </div>
  );
}
