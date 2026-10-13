"use client";

import { useState } from "react";
import { resolveTheme } from "@/content/theme";
import type { SiteConfig, SiteTheme } from "@/content/types";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminField, ImageField, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

const colorFields: { key: keyof SiteTheme; label: string; hint: string }[] = [
  {
    key: "background",
    label: "Fondo",
    hint: "Color de fondo de toda la página y del panel. Los demás colores tienen que leerse bien sobre este.",
  },
  {
    key: "text",
    label: "Texto",
    hint: "Color de los textos principales: la biografía, los datos de contacto, el nombre de cada foto y los enlaces del menú.",
  },
  {
    key: "heading",
    label: "Títulos",
    hint: "Color del nombre en la portada, de los títulos «Sobre mí» y «Contacto», y del título de la foto en la vista ampliada.",
  },
  {
    key: "muted",
    label: "Texto secundario",
    hint: "Color de los textos chicos y las etiquetas: los filtros de la galería, los rótulos del formulario, el pie de página.",
  },
  {
    key: "accent",
    label: "Acento",
    hint: "Color del puntito de disponibilidad en la barra y en la tarjeta de contacto, y el que resalta algunos detalles pequeños.",
  },
  {
    key: "button",
    label: "Botones",
    hint: "Color de fondo del botón «Enviar consulta», del ícono de correo de la barra y de los botones de este panel. El texto encima se pone claro u oscuro solo, según haga falta.",
  },
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
  useUnsavedChanges(
    !isSameContent(draft, { ...site, theme: resolveTheme(site.theme) }),
  );

  function setTheme(theme: SiteTheme) {
    setDraft({ ...draft, theme });
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Armá la paleta color por color. Podés tocar el cuadradito para elegir
        con el selector o pegar el código del color (por ejemplo #1a1a1a) en el
        campo de al lado. Los cambios se ven en el sitio al guardar.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {colorFields.map((field) => (
          <AdminField
            key={field.key}
            label={field.label}
            htmlFor={`theme-${field.key}`}
            hint={field.hint}
          >
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
        hint="Opcional. Reemplaza al texto de la barra (el de «Marca en la barra», en Identidad). Se muestra chico, de unos 24 px de alto, así que conviene un logo horizontal, en SVG o PNG con fondo transparente, y que contraste con el color de fondo."
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
