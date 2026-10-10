import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { site as fallbackSite } from "@/content/site";
import { resolveTheme } from "@/content/theme";
import type { SiteConfig } from "@/content/types";
import { getFirebaseApp } from "./firebase-app";
import {
  LOCAL_SITE_EVENT,
  readLocalSite,
  writeLocalSite,
} from "./local-site";

const SITE_COLLECTION = "settings";
const SITE_DOC = "site";

function getDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function mergeSite(
  remote: Partial<SiteConfig> | undefined,
  fallback: SiteConfig = fallbackSite,
): SiteConfig {
  if (!remote) return fallback;

  return {
    ...fallback,
    ...remote,
    photographer: {
      ...fallback.photographer,
      ...remote.photographer,
      logo: remote.photographer?.logo ?? fallback.photographer.logo,
      shortName: remote.photographer?.shortName ?? fallback.photographer.shortName,
      phone: remote.photographer?.phone ?? fallback.photographer.phone,
      links: remote.photographer?.links ?? fallback.photographer.links,
    },
    theme: resolveTheme({ ...fallback.theme, ...remote.theme }),
    seo: { ...fallback.seo, ...remote.seo },
    nav: remote.nav?.length ? remote.nav : fallback.nav,
    hero: {
      ...fallback.hero,
      ...remote.hero,
      focusX: remote.hero?.focusX ?? fallback.hero.focusX,
      focusY: remote.hero?.focusY ?? fallback.hero.focusY,
    },
    gallery: {
      ...fallback.gallery,
      ...remote.gallery,
      categories: remote.gallery?.categories ?? fallback.gallery.categories,
      works: remote.gallery?.works ?? fallback.gallery.works,
    },
    about: {
      ...fallback.about,
      ...remote.about,
      rows: remote.about?.rows ?? fallback.about.rows,
    },
    contact: {
      ...fallback.contact,
      ...remote.contact,
      projectTypes: remote.contact?.projectTypes ?? fallback.contact.projectTypes,
    },
  };
}

export async function getSiteContent(): Promise<SiteConfig> {
  const db = getDb();
  if (!db) {
    const local = readLocalSite();
    return local ? mergeSite(local) : fallbackSite;
  }

  try {
    const snap = await Promise.race([
      getDoc(doc(db, SITE_COLLECTION, SITE_DOC)),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 4000);
      }),
    ]);
    if (!snap.exists()) return fallbackSite;
    return mergeSite(snap.data() as Partial<SiteConfig>);
  } catch {
    return fallbackSite;
  }
}

export async function saveSiteContent(next: SiteConfig) {
  const db = getDb();
  if (!db) {
    writeLocalSite(next);
    return;
  }

  await setDoc(doc(db, SITE_COLLECTION, SITE_DOC), JSON.parse(JSON.stringify(next)));
}

export function subscribeSiteContent(
  onNext: (value: SiteConfig) => void,
): Unsubscribe | undefined {
  const db = getDb();
  if (!db) {
    if (typeof window === "undefined") return undefined;

    const emit = () => {
      const local = readLocalSite();
      onNext(local ? mergeSite(local) : fallbackSite);
    };
    emit();
    window.addEventListener(LOCAL_SITE_EVENT, emit);
    window.addEventListener("storage", emit);
    return () => {
      window.removeEventListener(LOCAL_SITE_EVENT, emit);
      window.removeEventListener("storage", emit);
    };
  }

  return onSnapshot(
    doc(db, SITE_COLLECTION, SITE_DOC),
    (snap) => {
      if (!snap.exists()) {
        onNext(fallbackSite);
        return;
      }
      onNext(mergeSite(snap.data() as Partial<SiteConfig>));
    },
    () => {
      onNext(fallbackSite);
    },
  );
}
