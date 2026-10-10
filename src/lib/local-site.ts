import type { SiteConfig } from "@/content/types";

const STORAGE_KEY = "portfolio-template.site";
export const LOCAL_SITE_EVENT = "portfolio-template-site";

export function readLocalSite(): Partial<SiteConfig> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SiteConfig>;
  } catch {
    return null;
  }
}

export function writeLocalSite(next: SiteConfig) {
  if (typeof window === "undefined") {
    throw new Error("El modo local solo funciona en el navegador.");
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(LOCAL_SITE_EVENT));
}
