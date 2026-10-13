"use client";

import { useState } from "react";
import type { SiteConfig } from "@/content/types";
import { unusedImageUrls } from "@/lib/managed-images";
import { saveSiteContent } from "@/lib/site-content";
import { deleteFiles } from "@/lib/upload";
import { useAdminFeedback } from "./admin-feedback";

export function useSectionSave(
  onSaved: (next: SiteConfig) => void,
  previous: SiteConfig,
) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { notify } = useAdminFeedback();

  async function save(next: SiteConfig) {
    setSaving(true);
    setMessage("");
    try {
      await saveSiteContent(next);
      const unused = unusedImageUrls(previous, next);
      if (unused.length) {
        try {
          await deleteFiles(unused);
        } catch {
          onSaved(next);
          notify("Cambios guardados.");
          setMessage("Algunas imágenes no se pudieron borrar del almacenamiento.");
          return true;
        }
      }
      onSaved(next);
      notify("Cambios guardados.");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving, message };
}
