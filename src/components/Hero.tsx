"use client";

import { useSite } from "@/content/site-context";
import { MaterialIcon } from "./MaterialIcon";
import { SmartImage } from "./SmartImage";

export function Hero() {
  const { hero, photographer } = useSite();
  const focusX = hero.focusX ?? 50;
  const focusY = hero.focusY ?? 50;

  if (!hero.enabled || (!hero.image && !photographer.name)) return null;

  return (
    <section className="relative flex min-h-[calc(100svh-3rem)] w-full items-end overflow-hidden px-margin-mobile pt-10 pb-16 md:min-h-[calc(100svh-3.5rem)] md:px-margin-tablet md:pt-12 md:pb-20 lg:px-margin-desktop">
      {hero.image ? (
        <div className="absolute inset-0 z-0">
          <SmartImage
            src={hero.image}
            alt={hero.imageAlt}
            priority
            sizes="100vw"
            objectPosition={`${focusX}% ${focusY}%`}
            className="scale-105 transition-transform duration-1000 ease-out"
          />
        </div>
      ) : null}

      {photographer.name ? (
        <h1 className="font-headline-md relative z-10 text-[28px] leading-tight tracking-[0.01em] text-heading drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] md:text-[40px] lg:text-[44px]">
          {photographer.name}
        </h1>
      ) : null}

      <a
        href="#galeria"
        aria-label="Bajar a la galería"
        className="absolute inset-x-0 bottom-5 z-10 flex justify-center text-on-surface-variant drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] transition-colors hover:text-primary md:bottom-6"
      >
        <MaterialIcon name="arrow_downward" className="animate-bounce text-[20px]" />
      </a>
    </section>
  );
}
