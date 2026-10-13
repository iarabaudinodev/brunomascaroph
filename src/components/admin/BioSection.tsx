"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, FieldHint, ImageField, SaveRow } from "./fields";
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
      <FieldHint>
        Todo lo de esta pestaña se ve en la sección «Sobre mí», la que viene
        después de la galería.
      </FieldHint>
      <AdminField
        label="Título"
        htmlFor="about-title"
        hint="Título de la sección, en mayúsculas grandes. Suele ser «Sobre mí», pero puede ser tu nombre o una frase corta."
      >
        <input
          id="about-title"
          className="field-input"
          placeholder="Sobre mí"
          value={draft.about.title}
          onChange={(event) =>
            setDraft({
              ...draft,
              about: { ...draft.about, title: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Biografía"
        htmlFor="bio"
        hint="El texto principal de la sección, debajo del título. Contá quién sos, cómo trabajás y qué fotografiás. Dos o tres párrafos cortos funcionan mejor que uno largo; los saltos de línea se respetan."
      >
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
        hint="Tu foto, al lado del texto en pantallas grandes y arriba del texto en el celular. Se muestra en blanco y negro y en formato vertical (3:4), así que elegí una donde quedes centrado. Si la dejás vacía, el texto ocupa todo el ancho."
        value={draft.about.portrait}
        folder="portrait"
        retainUrl={site.about.portrait}
        onChange={(portrait) =>
          setDraft({ ...draft, about: { ...draft.about, portrait } })
        }
      />
      <AdminField
        label="Texto alternativo del retrato"
        htmlFor="portrait-alt"
        hint="Descripción breve del retrato. No se ve en pantalla: la usan los lectores de pantalla y Google. Por ejemplo «Bruno Mascaro con su cámara en el estudio»."
      >
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
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Ficha (ubicación, enfoque, etc.)
          </span>
          <FieldHint>
            Lista de datos cortos que aparece debajo de la biografía, como una
            ficha técnica: a la izquierda la etiqueta («Base», «Enfoque»,
            «Equipo») y a la derecha el valor («Buenos Aires», «Bodas y
            retratos»). Las filas con el valor vacío no se muestran.
          </FieldHint>
        </div>
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
