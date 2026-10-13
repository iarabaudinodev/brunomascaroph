"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, ImageField, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

export function BioSection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(site);
  const { save, saving, message } = useSectionSave(onSaved, site);
  useUnsavedChanges(!isSameContent(draft, site));

  function updateRow(index: number, patch: { label?: string; value?: string }) {
    setDraft({
      ...draft,
      about: {
        ...draft.about,
        rows: draft.about.rows.map((row, rowIndex) =>
          rowIndex === index ? { ...row, ...patch } : row,
        ),
      },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminField label="Título" htmlFor="about-title">
        <input
          id="about-title"
          className="field-input"
          value={draft.about.title}
          onChange={(event) =>
            setDraft({
              ...draft,
              about: { ...draft.about, title: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Biografía" htmlFor="bio">
        <textarea
          id="bio"
          rows={8}
          className="field-input resize-none"
          value={draft.about.bio}
          onChange={(event) =>
            setDraft({
              ...draft,
              about: { ...draft.about, bio: event.target.value },
            })
          }
        />
      </AdminField>
      <ImageField
        label="Retrato"
        value={draft.about.portrait}
        folder="portrait"
        retainUrl={site.about.portrait}
        onChange={(portrait) =>
          setDraft({ ...draft, about: { ...draft.about, portrait } })
        }
      />
      <AdminField label="Texto alternativo del retrato" htmlFor="portrait-alt">
        <input
          id="portrait-alt"
          className="field-input"
          value={draft.about.portraitAlt}
          onChange={(event) =>
            setDraft({
              ...draft,
              about: { ...draft.about, portraitAlt: event.target.value },
            })
          }
        />
      </AdminField>

      <div className="flex flex-col gap-6">
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          Ficha (ubicación, enfoque, etc.)
        </span>
        {draft.about.rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="grid grid-cols-1 gap-4 border-b border-outline-variant/30 pb-6 md:grid-cols-[1fr_2fr_auto]"
          >
            <input
              className="field-input"
              value={row.label}
              placeholder="Etiqueta"
              onChange={(event) => updateRow(index, { label: event.target.value })}
            />
            <input
              className="field-input"
              value={row.value}
              placeholder="Valor"
              onChange={(event) => updateRow(index, { value: event.target.value })}
            />
            <AdminButton
              variant="danger"
              onClick={() =>
                setDraft({
                  ...draft,
                  about: {
                    ...draft.about,
                    rows: draft.about.rows.filter((_, rowIndex) => rowIndex !== index),
                  },
                })
              }
            >
              Quitar
            </AdminButton>
          </div>
        ))}
        <AdminButton
          variant="ghost"
          onClick={() =>
            setDraft({
              ...draft,
              about: {
                ...draft.about,
                rows: [...draft.about.rows, { label: "Nueva fila", value: "" }],
              },
            })
          }
        >
          + Agregar fila
        </AdminButton>
      </div>

      <SaveRow onSave={() => save(draft)} saving={saving} message={message} />
    </div>
  );
}
