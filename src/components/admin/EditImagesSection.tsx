"use client";

import { useState } from "react";
import type { SiteConfig, WorkItem } from "@/content/types";
import { imageUrlsOf } from "@/lib/managed-images";
import { deleteFiles } from "@/lib/upload";
import { cn } from "@/lib/cn";
import { MaterialIcon } from "../MaterialIcon";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, AdminSelect, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

const UNSORTED = "__sin-categoria__";

export function EditImagesSection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(site);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchCategory, setBatchCategory] = useState("");
  const [batchMeta, setBatchMeta] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([]);
  const { save, saving, message } = useSectionSave(onSaved, site);

  function toggleOpen(id: string) {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const dirty = !isSameContent(draft, site);
  useUnsavedChanges(dirty);

  const assignable = draft.gallery.categories.filter((category) => category.id !== "all");
  const knownIds = new Set(assignable.map((category) => category.id));
  const groups = [
    ...assignable.map((category) => ({
      id: category.id,
      label: category.label,
      fixed: false,
      works: draft.gallery.works.filter((work) => work.category === category.id),
    })),
    {
      id: UNSORTED,
      label: "Sin categoría",
      fixed: true,
      works: draft.gallery.works.filter((work) => !knownIds.has(work.category)),
    },
  ].filter((group) => !group.fixed || group.works.length);

  function setWorks(works: WorkItem[]) {
    setDraft({ ...draft, gallery: { ...draft.gallery, works } });
  }

  function patch(id: string, partial: Partial<WorkItem>) {
    setWorks(
      draft.gallery.works.map((work) =>
        work.id === id
          ? {
              ...work,
              ...partial,
              alt: partial.title !== undefined ? partial.title : work.alt,
            }
          : work,
      ),
    );
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
        setError("La imagen se quitó, pero el archivo sigue en el almacenamiento.");
      });
    }
  }

  function renameCategory(id: string, label: string) {
    setDraft({
      ...draft,
      gallery: {
        ...draft.gallery,
        categories: draft.gallery.categories.map((category) =>
          category.id === id ? { ...category, label } : category,
        ),
      },
    });
  }

  function removeCategory(id: string) {
    const used = draft.gallery.works.filter((work) => work.category === id).length;
    if (used > 0) {
      setError(
        `Hay ${used} ${used === 1 ? "imagen" : "imágenes"} en esta categoría. Movelas o eliminalas antes de borrarla.`,
      );
      return;
    }
    setError("");
    setDraft({
      ...draft,
      gallery: {
        ...draft.gallery,
        categories: draft.gallery.categories.filter((category) => category.id !== id),
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
    setWorks(
      draft.gallery.works.map((work) =>
        selectedIds.includes(work.id)
          ? {
              ...work,
              ...(batchCategory ? { category: batchCategory } : {}),
              ...(meta ? { meta } : {}),
            }
          : work,
      ),
    );
    setSelectedIds([]);
  }

  const total = draft.gallery.works.length;

  if (!total && !assignable.length) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        Todavía no hay imágenes ni categorías. Empezá por Cargar imágenes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="font-body-md text-body-md text-on-surface-variant">
        {total} {total === 1 ? "imagen" : "imágenes"} en {assignable.length}{" "}
        {assignable.length === 1 ? "categoría" : "categorías"}. Tocá una categoría
        para desplegarla. Cambiá su nombre escribiendo sobre él; solo se puede
        eliminar cuando está vacía.
      </p>

      {groups.map((group) => {
        const open = openIds.includes(group.id);
        const panelId = `cat-panel-${group.id}`;
        return (
        <section key={group.id} className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={open ? `Plegar ${group.label}` : `Desplegar ${group.label}`}
                onClick={() => toggleOpen(group.id)}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-primary transition-transform hover:opacity-80"
              >
                <MaterialIcon
                  name="chevron_right"
                  className={cn("text-[20px] transition-transform", open && "rotate-90")}
                />
              </button>
              {group.fixed ? (
                <button
                  type="button"
                  onClick={() => toggleOpen(group.id)}
                  className="font-headline-sm text-headline-sm cursor-pointer text-left text-primary"
                >
                  {group.label}
                </button>
              ) : (
                <input
                  className="field-input max-w-sm"
                  aria-label="Nombre de la categoría"
                  value={group.label}
                  onChange={(event) => renameCategory(group.id, event.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => toggleOpen(group.id)}
                className="font-label-sm text-label-sm shrink-0 cursor-pointer tracking-widest text-outline uppercase hover:text-primary"
              >
                {group.works.length} {group.works.length === 1 ? "imagen" : "imágenes"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {group.works.length && open ? (
                <AdminButton
                  variant="ghost"
                  onClick={() =>
                    setSelectedIds((current) => [
                      ...new Set([...current, ...group.works.map((work) => work.id)]),
                    ])
                  }
                >
                  Seleccionar todas
                </AdminButton>
              ) : null}
              {!group.fixed && !group.works.length ? (
                <AdminButton variant="danger" onClick={() => removeCategory(group.id)}>
                  Eliminar categoría
                </AdminButton>
              ) : null}
            </div>
          </div>

          {!open ? null : group.works.length ? (
            <div id={panelId} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {group.works.map((work) => (
                <article
                  key={work.id}
                  className="flex gap-4 border-b border-outline-variant/30 pb-4"
                >
                  <label className="relative h-24 w-20 shrink-0 cursor-pointer overflow-hidden bg-surface-container-lowest">
                    {work.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={work.src} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    <input
                      type="checkbox"
                      aria-label="Seleccionar imagen"
                      className="absolute top-1.5 left-1.5 h-4 w-4"
                      checked={selectedIds.includes(work.id)}
                      onChange={() => toggleSelected(work.id)}
                    />
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <input
                      className="field-input"
                      aria-label="Nombre"
                      value={work.title}
                      onChange={(event) => patch(work.id, { title: event.target.value })}
                    />
                    <AdminSelect
                      aria-label="Categoría"
                      value={knownIds.has(work.category) ? work.category : ""}
                      onChange={(event) => patch(work.id, { category: event.target.value })}
                    >
                      {!knownIds.has(work.category) ? (
                        <option value="" className="bg-surface-container-high text-primary">
                          Sin categoría
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
                    <div>
                      <AdminButton variant="danger" onClick={() => remove(work.id)}>
                        Eliminar
                      </AdminButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p
              id={panelId}
              className="font-label-sm text-label-sm tracking-widest text-outline uppercase"
            >
              Sin imágenes en esta categoría
            </p>
          )}
        </section>
        );
      })}

      {total ? (
        <div className="flex flex-col gap-6 border border-outline-variant/40 p-5">
          <div>
            <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
              Editar varias a la vez
            </p>
            <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
              Marcá las imágenes con la casilla sobre la miniatura y aplicales la
              misma categoría o el mismo texto. Lo que dejes vacío no se modifica.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
              {selectedIds.length} seleccionadas
            </span>
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
          <AdminField label="Mover a la categoría" htmlFor="batch-cat">
            <AdminSelect
              id="batch-cat"
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
          <div>
            <AdminButton onClick={applyBatch} disabled={!selectedIds.length}>
              Aplicar a {selectedIds.length || "las"} seleccionadas
            </AdminButton>
          </div>
        </div>
      ) : null}

      {error ? <p className="font-label-sm text-label-sm text-error">{error}</p> : null}

      <SaveRow
        onSave={() => {
          void save(draft);
        }}
        saving={saving}
        disabled={!dirty}
        message={message}
      />
    </div>
  );
}
