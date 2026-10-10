"use client";

import { useState } from "react";
import { resolveTheme } from "@/content/theme";
import type { SiteConfig, SiteTheme } from "@/content/types";
import { AdminField, ImageField, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

const colorFields: { key: keyof SiteTheme; label: string }[] = [
  { key: "background", label: "Fondo" },
  { key: "text", label: "Texto" },
  { key: "heading", label: "Títulos" },
  { key: "muted", label: "Texto secundario" },
  { key: "accent", label: "Acento" },
  { key: "button", label: "Botones" },
];

export function AppearanceSection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(() => ({
    ...site,
    theme: resolveTheme(site.theme),
  }));
  const { save, saving, message } = useSectionSave(onSaved, site);

  function setTheme(theme: SiteTheme) {
    setDraft({ ...draft, theme });
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Armá la paleta color por color. Títulos cubre el nombre, los títulos
        de sección y el de cada foto. Botones pinta el envío del formulario y
        el ícono de correo. El logo reemplaza el nombre corto en la barra.
        Conviene que se lea sobre el fondo.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {colorFields.map((field) => (
          <AdminField key={field.key} label={field.label} htmlFor={`theme-${field.key}`}>
            <div className="flex items-center gap-4">
              <input
                id={`theme-${field.key}`}
                type="color"
                value={
                  /^#[0-9a-f]{6}$/i.test(draft.theme[field.key])
                    ? draft.theme[field.key]
                    : "#000000"
                }
                onChange={(event) =>
                  setTheme({ ...draft.theme, [field.key]: event.target.value })
                }
                className="h-10 w-12 cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                className="field-input"
                value={draft.theme[field.key] ?? ""}
                spellCheck={false}
                onChange={(event) =>
                  setTheme({ ...draft.theme, [field.key]: event.target.value })
                }
              />
            </div>
          </AdminField>
        ))}
      </div>

      <ImageField
        label="Logo"
        value={draft.photographer.logo}
        folder="logo"
        retainUrl={site.photographer.logo}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        onChange={(logo) =>
          setDraft({
            ...draft,
            photographer: { ...draft.photographer, logo },
          })
        }
      />

      <SaveRow
        onSave={() => save({ ...draft, theme: resolveTheme(draft.theme) })}
        saving={saving}
        message={message}
      />
    </div>
  );
}
