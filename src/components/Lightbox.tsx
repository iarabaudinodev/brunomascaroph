"use client";

import { useEffect } from "react";
import type { WorkItem } from "@/content/types";
import { SmartImage } from "./SmartImage";

type LightboxProps = {
  work: WorkItem | null;
  onClose: () => void;
};

export function Lightbox({ work, onClose }: LightboxProps) {
  useEffect(() => {
    if (!work) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [work, onClose]);

  if (!work) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-container-lowest/90 p-4 backdrop-blur-xl md:p-12"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
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

      <div className="relative flex max-h-full w-full max-w-6xl flex-col items-center justify-center">
        <div className="relative flex max-h-[80vh] items-center justify-center overflow-hidden">
          <div className="relative h-[75vh] w-[min(90vw,72rem)]">
            <SmartImage
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
            {work.meta}
          </span>
        </div>
      </div>
    </div>
  );
}
