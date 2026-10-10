import type { SiteConfig } from "@/content/types";

export function imageUrlsOf(site: SiteConfig) {
  return [
    ...new Set(
      [
        site.photographer.logo,
        site.hero.image,
        site.about.portrait,
        ...site.gallery.works.map((work) => work.src),
      ].filter(
        Boolean,
      ),
    ),
  ];
}

export function unusedImageUrls(previous: SiteConfig, next: SiteConfig) {
  const keep = new Set(imageUrlsOf(next));
  return imageUrlsOf(previous).filter((url) => !keep.has(url));
}
