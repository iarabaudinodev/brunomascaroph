"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { uniqueSlug } from "@/lib/slug";
import { isSameContent, useUnsavedChanges } from "./admin-feedback";
import { AdminButton, AdminField, SaveRow } from "./fields";
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
      <AdminField label="Título" htmlFor="contact-title">
        <input
          id="contact-title"
          className="field-input"
          value={draft.contact.title}
          onChange={(event) =>
            setDraft({
              ...draft,
              contact: { ...draft.contact, title: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Subtítulo" htmlFor="contact-sub">
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
      <AdminField label="Nota de disponibilidad" htmlFor="contact-avail">
        <input
          id="contact-avail"
          className="field-input"
          value={draft.contact.availabilityNote}
          onChange={(event) =>
            setDraft({
              ...draft,
              contact: { ...draft.contact, availabilityNote: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          className="field-input"
          value={draft.photographer.email}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, email: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="Instagram" htmlFor="ig">
        <input
          id="ig"
          className="field-input"
          value={draft.photographer.instagram}
          onChange={(event) =>
            setDraft({
              ...draft,
              photographer: { ...draft.photographer, instagram: event.target.value },
            })
          }
        />
      </AdminField>
      <AdminField label="URL de Instagram" htmlFor="ig-url">
        <input
          id="ig-url"
          type="url"
          className="field-input"
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
      <AdminField label="Teléfono" htmlFor="phone">
        <input
          id="phone"
          type="tel"
          className="field-input"
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
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          Otras redes del footer
        </span>
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
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          Tipos de proyecto del formulario
        </span>
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
