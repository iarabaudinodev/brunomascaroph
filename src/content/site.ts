import { defaultTheme } from "./theme";
import type { SiteConfig } from "./types";

/**
 * Plantilla en blanco.
 * Cada entrega se completa desde /admin: Apariencia (colores y logo),
 * identidad, bio, contacto y obras. Este archivo es solo el punto de partida.
 */
export const site: SiteConfig = {
  photographer: {
    name: "",
    shortName: "",
    logo: "",
    role: "",
    location: "",
    available: false,
    availabilityLabel: "",
    instagram: "",
    instagramUrl: "",
    email: "",
  },
  theme: defaultTheme,
  seo: {
    title: "Portfolio",
    description: "",
  },
  nav: [
    { id: "galeria", href: "#galeria", label: "Trabajo" },
    { id: "sobre-mi", href: "#sobre-mi", label: "Sobre mí" },
    { id: "contacto", href: "#contacto", label: "Contacto" },
  ],
  hero: {
    image: "",
    imageAlt: "",
    focusX: 50,
    focusY: 50,
  },
  gallery: {
    title: "Trabajo",
    categories: [{ id: "all", label: "Todos" }],
    works: [],
  },
  about: {
    title: "Sobre mí",
    bio: "",
    portrait: "",
    portraitAlt: "",
    rows: [],
  },
  contact: {
    title: "",
    subtitle: "",
    availabilityNote: "",
    projectTypes: [],
  },
};
