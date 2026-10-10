"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "@/content/site-context";
import type { WorkItem } from "@/content/types";
import { cn } from "@/lib/cn";
import { Lightbox } from "./Lightbox";
import { MaterialIcon } from "./MaterialIcon";
import { SectionFade } from "./SectionFade";
import { SmartImage } from "./SmartImage";

function ratioFromAspect(aspect: string) {
  if (aspect.includes("square")) return 1;
  const match = aspect.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (match) return Number(match[1]) / Number(match[2]);
  return 3 / 2;
}

function packPages(
  works: WorkItem[],
  ratios: Record<string, number>,
  maxWidth: number,
  rowHeight: number,
  gap: number,
) {
  const pages: WorkItem[][][] = [];
  let rows: WorkItem[][] = [[], []];
  let used = [0, 0];

  function flush() {
    const filled = rows.filter((row) => row.length);
    if (filled.length) pages.push(filled);
    rows = [[], []];
    used = [0, 0];
  }

  function extra(rowIndex: number, width: number) {
    return (rows[rowIndex].length ? gap : 0) + width;
  }

  for (const work of works) {
    const width = Math.min(
      (ratios[work.id] ?? ratioFromAspect(work.aspect)) * rowHeight,
      maxWidth,
    );
    let target = used[0] <= used[1] ? 0 : 1;
    if (used[target] + extra(target, width) > maxWidth + 1) {
      target = target === 0 ? 1 : 0;
    }
    if (used[target] + extra(target, width) > maxWidth + 1) {
      flush();
      target = 0;
    }
    used[target] += extra(target, width);
    rows[target].push(work);
  }

  flush();
  return pages;
}

export function Gallery() {
  const { gallery } = useSite();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<WorkItem | null>(null);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [frame, setFrame] = useState({ width: 0, rowHeight: 0, gap: 8 });
  const frameRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!gallery.categories.some((category) => category.id === filter)) {
      setFilter("all");
    }
  }, [filter, gallery.categories]);

  const works = useMemo(
    () =>
      gallery.works.filter(
        (work) => work.src && (filter === "all" || work.category === filter),
      ),
    [filter, gallery.works],
  );

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    function measure() {
      if (!frameRef.current) return;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setFrame({
        width: frameRef.current.clientWidth,
        rowHeight: window.innerHeight * (desktop ? 0.56 : 0.36),
        gap: desktop ? 8 : 6,
      });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const pages = useMemo(() => {
    if (!works.length || frame.width < 80) {
      const mid = Math.ceil(works.length / 2);
      return [[works.slice(0, mid), works.slice(mid)].filter((row) => row.length)];
    }
    return packPages(works, ratios, frame.width, frame.rowHeight, frame.gap);
  }, [works, ratios, frame]);

  const pageCount = Math.max(pages.length, 1);
  const current = pages[Math.min(page, pageCount - 1)] ?? [];

  useEffect(() => {
    const upcoming = pages[page + 1];
    if (!upcoming) return;
    upcoming.flat().forEach((work) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = work.src;
    });
  }, [page, pages]);

  useEffect(() => {
    setPage(0);
  }, [filter, works.length]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(pageCount - 1, next));
      if (clamped === page) return;
      setVisible(false);
      window.setTimeout(() => {
        setPage(clamped);
        setVisible(true);
      }, 180);
    },
    [page, pageCount],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (selected) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") goTo(page - 1);
      if (event.key === "ArrowRight") goTo(page + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, page, selected]);

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-heading"
      className="relative w-full bg-surface py-10 md:py-14"
    >
      <h2 id="galeria-heading" className="sr-only">
        Galería
      </h2>
      <nav className="font-label-sm text-label-sm flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-margin-mobile pb-5 tracking-widest text-on-surface-variant uppercase md:gap-6 md:px-margin-tablet md:pb-7 lg:px-margin-desktop">
        {gallery.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFilter(category.id)}
            className={cn(
              "whitespace-nowrap cursor-pointer transition-all hover:text-primary",
              filter === category.id
                ? "text-primary underline decoration-1 underline-offset-8"
                : "text-outline",
            )}
          >
            [ {category.label} ]
          </button>
        ))}
      </nav>

      <div
        ref={frameRef}
        className="relative z-0 overflow-hidden px-margin-mobile md:px-margin-tablet lg:px-margin-desktop"
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchX.current == null) return;
          const delta = event.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(delta) < 48) return;
          goTo(page + (delta < 0 ? 1 : -1));
        }}
      >
        <SectionFade edge="top" className="h-8 md:h-36" />
        <SectionFade edge="bottom" className="h-8 md:h-28" />
        <div
          className={cn(
            "flex flex-col justify-center gap-1.5 transition-opacity duration-500 md:gap-2",
            works.length === 0 ? "min-h-24" : "min-h-[36vh] md:min-h-[56vh]",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          {works.length === 0 ? (
            <p className="font-label-sm text-label-sm py-16 text-center tracking-widest text-outline uppercase">
              Sin fotos todavía
            </p>
          ) : null}
          {current.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center gap-1.5 md:gap-2">
              {row.map((work) => (
                <button
                  key={work.id}
                  type="button"
                  onClick={() => setSelected(work)}
                  className="group inline-flex max-h-[36vh] max-w-full cursor-pointer items-center p-0 md:max-h-[56vh]"
                >
                  <SmartImage
                    src={work.src}
                    alt={work.alt}
                    fill={false}
                    loading="eager"
                    fetchPriority="high"
                    className={cn(
                      "h-auto max-h-[36vh] w-auto max-w-full object-contain md:max-h-[56vh]",
                      "transition-opacity duration-700 ease-out group-hover:opacity-95",
                      work.grayscale && "contrast-110 grayscale",
                    )}
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      if (!image.naturalHeight) return;
                      const ratio = image.naturalWidth / image.naturalHeight;
                      setRatios((current) =>
                        current[work.id] === ratio
                          ? current
                          : { ...current, [work.id]: ratio },
                      );
                    }}
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-6 px-margin-mobile md:mt-10 md:gap-8">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page === 0}
            onClick={() => goTo(page - 1)}
            className="flex h-8 w-8 items-center justify-center text-primary transition-opacity disabled:opacity-20"
          >
            <MaterialIcon name="chevron_left" className="text-[18px]" />
          </button>
          <div className="flex items-center gap-3">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Página ${index + 1}`}
                aria-current={index === page ? "page" : undefined}
                onClick={() => goTo(index)}
                className={cn(
                  "h-px cursor-pointer transition-all duration-500",
                  index === page
                    ? "w-8 bg-primary"
                    : "w-3 bg-outline hover:bg-primary",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page >= pageCount - 1}
            onClick={() => goTo(page + 1)}
            className="flex h-8 w-8 items-center justify-center text-primary transition-opacity disabled:opacity-20"
          >
            <MaterialIcon name="chevron_right" className="text-[18px]" />
          </button>
        </div>
      ) : null}

      <Lightbox work={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
