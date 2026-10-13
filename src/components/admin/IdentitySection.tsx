"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminField, FieldHint, ImageField, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

function SectionTitle({ children, hint }: { children: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-outline-variant/30 pt-8">
      <span className="font-label-md text-label-md tracking-widest text-primary uppercase">
        {children}
      </span>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
}

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

  const titleLength = draft.seo.title.length;
  const descLength = draft.seo.description.length;

  return (
    <div className="flex flex-col gap-8">
      <AdminField
        label="Nombre"
        htmlFor="name"
        hint="Tu nombre completo o el de tu estudio. Es el título grande de la portada y el nombre que acompaña a las consultas del formulario."
      >
        <input
          id="name"
          className="field-input"
          placeholder="Bruno Mascaro"
          value={draft.photographer.name}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, name: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Marca en la barra (navbar)"
        htmlFor="short-name"
        hint="Texto corto que va arriba a la izquierda, en la barra fija que acompaña toda la página. Conviene que sea breve, por ejemplo tus iniciales o tu usuario. Si subís un logo en Apariencia, el logo reemplaza este texto."
      >
        <input
          id="short-name"
          className="field-input"
          placeholder="BRUNO MASCARO"
          value={draft.photographer.shortName ?? ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, shortName: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Ciudad"
        htmlFor="location"
        hint="Se ve arriba a la derecha de la barra, solo en pantallas grandes, junto a la etiqueta de disponibilidad. Dejalo vacío si no querés mostrarla."
      >
        <input
          id="location"
          className="field-input"
          placeholder="CABA"
          value={draft.photographer.location}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, location: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Etiqueta de disponibilidad"
        htmlFor="availability"
        hint="Palabra corta que aparece al lado de la ciudad con un puntito de color cuando la casilla de abajo está marcada. Por ejemplo «Disponible» o «Agenda 2026»."
      >
        <input
          id="availability"
          className="field-input"
          placeholder="Disponible"
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
      <div className="flex flex-col gap-2">
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
        <FieldHint>
          Marcada, muestra la etiqueta de disponibilidad en la barra. Desmarcala
          cuando no estés tomando trabajos y la etiqueta desaparece sin borrar el
          texto.
        </FieldHint>
      </div>

      <SectionTitle hint="La portada es la foto a pantalla completa con tu nombre que se ve al entrar al sitio. Si la apagás, el sitio arranca directamente en la galería.">
        Portada
      </SectionTitle>
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
        Mostrar portada
      </label>

      {draft.hero.enabled ? (
        <>
          <ImageField
            label="Imagen de la portada"
            hint="Elegí una foto horizontal y de buena resolución: ocupa toda la pantalla, también en el celular, donde se recorta a lo alto. Se optimiza sola al subirla."
            value={draft.hero.image}
            folder="hero"
            retainUrl={site.hero.image}
            onChange={(image) => setDraft({ ...draft, hero: { ...draft.hero, image } })}
          />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
                Encuadre de la portada
              </span>
              <FieldHint>
                Como la foto se recorta según el tamaño de la pantalla, acá elegís
                qué parte tiene que quedar siempre visible. Movés los controles y
                la vista previa muestra el resultado.
              </FieldHint>
            </div>
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
          <AdminField
            label="Texto alternativo de la portada"
            htmlFor="hero-alt"
            hint="Descripción breve de la foto. No se ve en pantalla: la leen los lectores de pantalla y Google. Por ejemplo «Retrato en blanco y negro de una pareja en la playa»."
          >
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

      <SectionTitle hint="Estos textos no aparecen dentro de la página. Son lo que muestran Google y otros buscadores en los resultados, y lo que se ve en la pestaña del navegador y al compartir el link por WhatsApp o redes. Escribilos pensando en alguien que todavía no te conoce.">
        Buscadores (SEO)
      </SectionTitle>
      <AdminField
        label="Título SEO"
        htmlFor="seo-title"
        hint={
          <>
            Es el título azul del resultado en Google y el nombre de la pestaña.
            Incluí tu nombre, qué fotografiás y dónde, por ejemplo «Bruno Mascaro ·
            Fotógrafo de quinces y bodas en Buenos Aires». Hasta {SEO_TITLE_MAX}{" "}
            caracteres; más largo, Google lo corta.
            <span className={titleLength > SEO_TITLE_MAX ? " text-error" : ""}>
              {" "}
              Llevás {titleLength}.
            </span>
          </>
        }
      >
        <input
          id="seo-title"
          className="field-input"
          placeholder="Bruno Mascaro · Fotógrafo en Buenos Aires"
          value={draft.seo.title}
          onChange={(event) =>
            setDraft({ ...draft, seo: { ...draft.seo, title: event.target.value } })
          }
        />
      </AdminField>
      <AdminField
        label="Descripción SEO"
        htmlFor="seo-desc"
        hint={
          <>
            Es el párrafo gris debajo del título en Google y el texto de la vista
            previa al compartir el link. Contá en una o dos frases qué hacés, para
            quién y cómo contactarte. Hasta {SEO_DESC_MAX} caracteres.
            <span className={descLength > SEO_DESC_MAX ? " text-error" : ""}>
              {" "}
              Llevás {descLength}.
            </span>
          </>
        }
      >
        <textarea
          id="seo-desc"
          rows={3}
          className="field-input resize-none"
          placeholder="Fotografía de quinces, bodas y eventos en Buenos Aires. Sesiones con luz natural y entrega en alta calidad. Escribime para reservar tu fecha."
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
