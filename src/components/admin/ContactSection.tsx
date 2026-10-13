"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { uniqueSlug } from "@/lib/slug";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, FieldHint, SaveRow } from "./fields";
import { useSectionSave } from "./use-section-save";

export function ContactSection({
  site,
  onSaved,
}: {
  site: SiteConfig;
  onSaved: (next: SiteConfig) => void;
}) {
  const [draft, setDraft] = useState(site);
  const [newType, setNewType] = useState("");
  const { save, saving, message } = useSectionSave(onSaved, site);
  useUnsavedChanges(!isSameContent(draft, site));

  return (
    <div className="flex flex-col gap-8">
      <FieldHint>
        Esta pestaña arma la sección «Contacto», la última de la página, y los
        datos de contacto del pie. El formulario envía las consultas a la pestaña
        Consultas de este panel.
      </FieldHint>
      <AdminField
        label="Título"
        htmlFor="contact-title"
        hint="Título grande de la sección de contacto, a la izquierda del formulario. Por ejemplo «Hablemos» o «Contacto»."
      >
        <input
          id="contact-title"
          className="field-input"
          placeholder="Hablemos"
          value={draft.contact.title}
          onChange={(event) =>
            setDraft({
              ...draft,
              contact: { ...draft.contact, title: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Subtítulo"
        htmlFor="contact-sub"
        hint="Frase corta debajo del título, para invitar a escribirte. Por ejemplo «Contame tu idea y te respondo en el día». Puede quedar vacío."
      >
        <textarea
          id="contact-sub"
          rows={3}
          className="field-input resize-none"
          value={draft.contact.subtitle}
          onChange={(event) =>
            setDraft({
              ...draft,
              contact: { ...draft.contact, subtitle: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Nota de disponibilidad"
        htmlFor="contact-avail"
        hint="Aparece en la tarjeta de contacto bajo «Disponibilidad actual», con un puntito de color. Sirve para avisar fechas, por ejemplo «Tomando reservas para 2026». Vacío, la fila no se muestra."
      >
        <input
          id="contact-avail"
          className="field-input"
          placeholder="Tomando reservas para 2026"
          value={draft.contact.availabilityNote}
          onChange={(event) =>
            setDraft({
              ...draft,
              contact: { ...draft.contact, availabilityNote: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Email"
        htmlFor="email"
        hint="Tu correo público. Se ve en la tarjeta de contacto bajo «Correo directo» y como ícono en el pie; al tocarlo se abre el programa de correo del visitante. No es el correo con el que entrás a este panel."
      >
        <input
          id="email"
          type="email"
          className="field-input"
          placeholder="hola@tudominio.com"
          value={draft.photographer.email}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, email: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Instagram"
        htmlFor="ig"
        hint="Tu usuario tal como querés que se lea, por ejemplo «brunomascaroph». Se muestra en la tarjeta de contacto y en el pie."
      >
        <input
          id="ig"
          className="field-input"
          placeholder="brunomascaroph"
          value={draft.photographer.instagram}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, instagram: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField
        label="URL de Instagram"
        htmlFor="ig-url"
        hint="La dirección completa de tu perfil, empezando con https://. Es adonde lleva el usuario de arriba al tocarlo. Sin esto, el usuario se ve pero no es un enlace."
      >
        <input
          id="ig-url"
          type="url"
          className="field-input"
          placeholder="https://www.instagram.com/brunomascaroph"
          value={draft.photographer.instagramUrl}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: {
                ...draft.photographer,
                instagramUrl: event.target.value,
              },
            })
          }
        />
      </AdminField>
      <AdminField
        label="Teléfono"
        htmlFor="phone"
        hint="Se muestra como ícono de teléfono en el pie; al tocarlo desde el celular inicia la llamada. Poné el número con código de país, por ejemplo +54 9 11 1234 5678. Vacío, el ícono no aparece."
      >
        <input
          id="phone"
          type="tel"
          className="field-input"
          placeholder="+54 9 11 1234 5678"
          value={draft.photographer.phone ?? ""}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, phone: event.target.value },
            })
          }
        />
      </AdminField>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Otras redes del pie
          </span>
          <FieldHint>
            Enlaces extra que aparecen como íconos en el pie de página, junto al
            correo, el teléfono e Instagram. En «Nombre» poné cómo se llama la red
            (WhatsApp, Behance, YouTube…) y en el otro campo la dirección completa.
            Para WhatsApp usá https://wa.me/ seguido de tu número sin espacios ni
            signos.
          </FieldHint>
        </div>
        {(draft.photographer.links ?? []).map((link, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <input
              className="field-input"
              placeholder="Nombre"
              value={link.label}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  photographer: {
                    ...draft.photographer,
                    links: draft.photographer.links.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  },
                })
              }
            />
            <input
              className="field-input"
              placeholder="https://"
              value={link.href}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  photographer: {
                    ...draft.photographer,
                    links: draft.photographer.links.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, href: event.target.value } : item,
                    ),
                  },
                })
              }
            />
            <AdminButton
              variant="danger"
              onClick={() =>
                setDraft({
                  ...draft,
                  photographer: {
                    ...draft.photographer,
                    links: draft.photographer.links.filter((_, itemIndex) => itemIndex !== index),
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
              photographer: {
                ...draft.photographer,
                links: [...(draft.photographer.links ?? []), { label: "", href: "" }],
              },
            })
          }
        >
          + Agregar red
        </AdminButton>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Tipos de proyecto del formulario
          </span>
          <FieldHint>
            Opciones del desplegable «Tipo de proyecto» del formulario de contacto,
            para que el visitante te diga qué necesita (Quinces, Boda, Retrato,
            Evento…). Lo que elija llega con la consulta. Si no dejás ninguna, el
            desplegable no se muestra.
          </FieldHint>
        </div>
        {draft.contact.projectTypes.map((type, index) => (
          <div
            key={type.value}
            className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-3"
          >
            <input
              className="field-input"
              value={type.label}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contact: {
                    ...draft.contact,
                    projectTypes: draft.contact.projectTypes.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  },
                })
              }
            />
            <AdminButton
              variant="danger"
              onClick={() =>
                setDraft({
                  ...draft,
                  contact: {
                    ...draft.contact,
                    projectTypes: draft.contact.projectTypes.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  },
                })
              }
            >
              Quitar
            </AdminButton>
          </div>
        ))}
        <div className="flex items-end gap-4">
          <AdminField label="Nuevo tipo" htmlFor="new-type">
            <input
              id="new-type"
              className="field-input"
              value={newType}
              onChange={(event) => setNewType(event.target.value)}
            />
          </AdminField>
          <AdminButton
            variant="ghost"
            onClick={() => {
              const label = newType.trim();
              if (!label) return;
              const value = uniqueSlug(
                label,
                draft.contact.projectTypes.map((type) => type.value),
              );
              setDraft({
                ...draft,
                contact: {
                  ...draft.contact,
                  projectTypes: [...draft.contact.projectTypes, { value, label }],
                },
              });
              setNewType("");
            }}
          >
            + Agregar
          </AdminButton>
        </div>
      </div>

      <SaveRow onSave={() => save(draft)} saving={saving} message={message} />
    </div>
  );
}
