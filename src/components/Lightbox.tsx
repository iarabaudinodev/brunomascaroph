"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WorkItem } from "@/content/types";
import { MaterialIcon } from "./MaterialIcon";
import { SmartImage } from "./SmartImage";

type LightboxProps = {
  work: WorkItem | null;
  /** Lista por la que se navega con las flechas (la galería filtrada). */
  works?: WorkItem[];
  onClose: () => void;
  onSelect?: (work: WorkItem) => void;
};

export function Lightbox({ work, works = [], onClose, onSelect }: LightboxProps) {
  const touchX = useRef<number | null>(null);
  const index = work ? works.findIndex((item) => item.id === work.id) : -1;
  const canNavigate = Boolean(onSelect) && works.length > 1 && index >= 0;

  const go = useCallback(
    (delta: number) => {
      if (!canNavigate || !onSelect) return;
      const next = (index + delta + works.length) % works.length;
      onSelect(works[next]);
    },
    [canNavigate, index, onSelect, works],
  );

  useEffect(() => {
    if (!work) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [work, onClose, go]);

  // Precarga la siguiente y la anterior para que el cambio sea inmediato.
  useEffect(() => {
    if (!canNavigate) return;
    [1, -1].forEach((delta) => {
      const neighbour = works[(index + delta + works.length) % works.length];
      if (!neighbour?.src) return;
      const image = new window.Image();
      image.decoding = "async";
      image.src = neighbour.src;
    });
  }, [canNavigate, index, works]);

  if (!work) return null;

  const navButton =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface-container-high/40 text-primary transition-colors hover:text-outline md:h-12 md:w-12";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-container-lowest/90 p-4 backdrop-blur-xl md:p-12"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(delta) < 48) return;
        go(delta < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        aria-label="Cerrar vista ampliada"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container-high/40 text-xl font-light text-primary transition-colors hover:text-outline md:top-6 md:right-8 md:h-12 md:w-12 md:text-2xl"
      >
        ✕
      </button>

      {canNavigate ? (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => go(-1)}
            className={`${navButton} left-2 md:left-6`}
          >
            <MaterialIcon name="chevron_left" className="text-[26px]" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={() => go(1)}
            className={`${navButton} right-2 md:right-6`}
          >
            <MaterialIcon name="chevron_right" className="text-[26px]" />
          </button>
        </>
      ) : null}

      <div className="relative flex max-h-full w-full max-w-6xl flex-col items-center justify-center">
        <div className="relative flex max-h-[80vh] items-center justify-center overflow-hidden">
          <div className="relative h-[75vh] w-[min(90vw,72rem)]">
            <SmartImage
              key={work.id}
              src={work.src}
              alt={work.alt}
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
        <div className="mt-4 flex w-full flex-col items-center justify-between border-t border-outline-variant/30 pt-6 text-center sm:flex-row sm:text-left">
          <h4 className="font-headline-sm text-headline-sm tracking-tight text-heading">
            {work.title}
          </h4>
          <span className="font-label-sm text-label-sm mt-2 tracking-widest text-outline uppercase sm:mt-0">
            {canNavigate ? (
              <>
                {index + 1} / {works.length}
                {work.meta ? <span aria-hidden> · </span> : null}
              </>
            ) : null}
            {work.meta}
          </span>
        </div>
      </div>
    </div>
  );
}
