"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/content/site-context";
import { cn } from "@/lib/cn";
import { MaterialIcon } from "./MaterialIcon";

export function Header() {
  const site = useSite();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("galeria");

  useEffect(() => {
    const ids = site.nav.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [site.nav]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-transparent backdrop-blur-[2px]">
      <div className="flex h-12 w-full items-center justify-between gap-3 px-margin-mobile md:h-14 md:px-margin-tablet lg:px-margin-desktop">
        <a
          href="#top"
          className="font-label-sm flex min-w-0 items-center text-[10px] tracking-[0.18em] text-primary uppercase transition-opacity hover:opacity-80 md:text-[11px]"
        >
          {site.photographer.logo ? (
            // El logo puede ser SVG o un recorte con transparencia.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.photographer.logo}
              alt={site.photographer.shortName || site.photographer.name || "Logo"}
              className="h-5 w-auto max-w-[9rem] object-contain md:h-6"
            />
          ) : (
            <span className="truncate">{site.photographer.shortName}</span>
          )}
        </a>

        <nav className="hidden items-center gap-editorial-gap-sm md:flex">
          {site.nav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "font-label-md text-label-md tracking-widest uppercase transition-colors",
                active === item.id
                  ? "text-primary underline decoration-1 underline-offset-8"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          {site.photographer.location ||
          (site.photographer.available && site.photographer.availabilityLabel) ? (
            <div className="hidden items-center gap-2 lg:flex">
              {site.photographer.available ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              ) : null}
              <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
                {site.photographer.location}
                {site.photographer.available && site.photographer.availabilityLabel
                  ? `${site.photographer.location ? " / " : ""}${site.photographer.availabilityLabel}`
                  : ""}
              </span>
            </div>
          ) : null}

          <a
            href="#contacto"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-button"
            aria-label="Ir a contacto"
            onClick={() => setOpen(false)}
          >
            <MaterialIcon name="mail" className="text-[14px] text-on-button" />
          </a>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center text-primary md:hidden"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((value) => !value)}
          >
            <MaterialIcon name={open ? "close" : "menu"} className="text-[20px]" />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-outline-variant/40 px-margin-mobile py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {site.nav.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-label-md text-label-md tracking-widest uppercase transition-colors",
                  active === item.id
                    ? "text-primary underline decoration-1 underline-offset-8"
                    : "text-on-surface-variant",
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
