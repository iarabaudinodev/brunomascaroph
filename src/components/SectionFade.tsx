import { cn } from "@/lib/cn";

export function SectionFade({
  edge,
  className,
}: {
  edge: "top" | "bottom";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 h-24 md:h-36",
        edge === "top" && "top-0 bg-gradient-to-b from-surface to-transparent",
        edge === "bottom" && "bottom-0 bg-gradient-to-t from-surface to-transparent",
        className,
      )}
    />
  );
}
