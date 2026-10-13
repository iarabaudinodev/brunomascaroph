"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminField, ImageField, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

export function IdentitySection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(site);
  const { save, saving, message } = useSectionSave(onSaved, site);
  useUnsavedChanges(!isSameContent(draft, site));

  return (
    <div className="flex flex-col gap-8">
      <AdminField label="Nombre" htmlFor="name">
        <input
          id="name"
          className="field-input"
          value={draft.photographer.name}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, name: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Marca en la barra (navbar)" htmlFor="short-name">
        <input
          id="short-name"
          className="field-input"
          value={draft.photographer.shortName ?? ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, shortName: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Rol / disciplina" htmlFor="role">
        <input
          id="role"
          className="field-input"
          value={draft.photographer.role}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, role: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Ciudad" htmlFor="location">
        <input
          id="location"
          className="field-input"
          value={draft.photographer.location}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, location: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Etiqueta de disponibilidad" htmlFor="availability">
        <input
          id="availability"
          className="field-input"
          value={draft.photographer.availabilityLabel}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: {
                ...draft.photographer,
                availabilityLabel: event.target.value,
              },
            })
          }
        />
      </AdminField>
      <label className="font-label-sm text-label-sm flex items-center gap-3 tracking-widest text-on-surface-variant uppercase">
        <input
          type="checkbox"
          checked={draft.photographer.available}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: {
                ...draft.photographer,
                available: event.target.checked,
              },
            })
          }
        />
        Mostrar como disponible
      </label>

      <div className="flex flex-col gap-3 border-t border-outline-variant/30 pt-8">
        <label className="font-label-sm text-label-sm flex items-center gap-3 tracking-widest text-on-surface-variant uppercase">
          <input
            type="checkbox"
            checked={draft.hero.enabled}
            onChange={(event) =>
              setDraft({
                ...draft,
                hero: { ...draft.hero, enabled: event.target.checked },
              })
            }
          />
          Mostrar portada (hero)
        </label>
        <p className="font-body-md text-body-md text-on-surface-variant">
          La portada es la foto a pantalla completa con tu nombre que se ve al
          entrar. Si la apagás, el sitio arranca directamente en la galería.
        </p>
      </div>

      {draft.hero.enabled ? (
      <>
      <ImageField
        label="Imagen de la portada"
        value={draft.hero.image}
        folder="hero"
        retainUrl={site.hero.image}
        onChange={(image) => setDraft({ ...draft, hero: { ...draft.hero, image } })}
      />
      <div className="flex flex-col gap-4">
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          Encuadre de la portada
        </span>
        {draft.hero.image ? (
          <div className="relative aspect-[16/7] w-full overflow-hidden bg-surface-container-lowest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.hero.image}
              alt=""
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${draft.hero.focusX ?? 50}% ${draft.hero.focusY ?? 50}%`,
              }}
            />
          </div>
        ) : null}
        <AdminField label={`Horizontal ${draft.hero.focusX ?? 50}%`} htmlFor="focus-x">
          <input
            id="focus-x"
            type="range"
            min={0}
            max={100}
            value={draft.hero.focusX ?? 50}
            onChange={(event) =>
              setDraft({
                ...draft,
                hero: { ...draft.hero, focusX: Number(event.target.value) },
              })
            }
          />
        </AdminField>
        <AdminField label={`Vertical ${draft.hero.focusY ?? 50}%`} htmlFor="focus-y">
          <input
            id="focus-y"
            type="range"
            min={0}
            max={100}
            value={draft.hero.focusY ?? 50}
            onChange={(event) =>
              setDraft({
                ...draft,
                hero: { ...draft.hero, focusY: Number(event.target.value) },
              })
            }
          />
        </AdminField>
      </div>
      <AdminField label="Texto alternativo de la portada" htmlFor="hero-alt">
        <input
          id="hero-alt"
          className="field-input"
          value={draft.hero.imageAlt}
          onChange={(event) =>
            setDraft({
              ...draft,
              hero: { ...draft.hero, imageAlt: event.target.value },
            })
          }
        />
      </AdminField>
      </>
      ) : null}

      <AdminField label="Título SEO" htmlFor="seo-title">
        <input
          id="seo-title"
          className="field-input"
          value={draft.seo.title}
          onChange={(event) =>
            setDraft({ ...draft, seo: { ...draft.seo, title: event.target.value } })
          }
        />
      </AdminField>
      <AdminField label="Descripción SEO" htmlFor="seo-desc">
        <textarea
          id="seo-desc"
          rows={3}
          className="field-input resize-none"
          value={draft.seo.description}
          onChange={(event) =>
            setDraft({
              ...draft,
              seo: { ...draft.seo, description: event.target.value },
            })
          }
        />
      </AdminField>
      <SaveRow onSave={() => save(draft)} saving={saving} message={message} />
    </div>
  );
}
