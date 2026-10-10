export type GalleryCategory = {
  id: string;
  label: string;
};

export type WorkItem = {
  id: string;
  title: string;
  meta: string;
  alt: string;
  src: string;
  category: string;
  span: string;
  aspect: string;
  className?: string;
  grayscale?: boolean;
};

export type ProjectType = {
  value: string;
  label: string;
};

export type NavItem = {
  href: string;
  label: string;
  id: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type SiteTheme = {
  background: string;
  text: string;
  heading: string;
  muted: string;
  accent: string;
  button: string;
};

export type SiteConfig = {
  photographer: {
    name: string;
    shortName: string;
    logo: string;
    role: string;
    location: string;
    available: boolean;
    availabilityLabel: string;
    instagram: string;
    instagramUrl: string;
    email: string;
    phone: string;
    links: FooterLink[];
  };
  theme: SiteTheme;
  seo: {
    title: string;
    description: string;
  };
  nav: NavItem[];
  hero: {
    image: string;
    imageAlt: string;
    focusX: number;
    focusY: number;
  };
  gallery: {
    title: string;
    categories: GalleryCategory[];
    works: WorkItem[];
  };
  about: {
    title: string;
    bio: string;
    portrait: string;
    portraitAlt: string;
    rows: { label: string; value: string; muted?: boolean }[];
  };
  contact: {
    title: string;
    subtitle: string;
    availabilityNote: string;
    projectTypes: ProjectType[];
  };
};
