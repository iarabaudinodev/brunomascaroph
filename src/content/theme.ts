import type { CSSProperties } from "react";
import type { SiteTheme } from "./types";

export const defaultTheme: SiteTheme = {
  background: "#131313",
  text: "#f3f0eb",
  heading: "#f3f0eb",
  muted: "#9c9892",
  accent: "#f3f0eb",
  button: "#f3f0eb",
};

export function normalizeHex(value: string | undefined, fallback: string) {
  const raw = value?.trim() ?? "";
  const six = raw.match(/^#?([0-9a-f]{6})$/i);
  if (six) return `#${six[1].toLowerCase()}`;
  const three = raw.match(/^#?([0-9a-f]{3})$/i);
  if (three) {
    const [r, g, b] = three[1].toLowerCase().split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

export function resolveTheme(theme: Partial<SiteTheme> | undefined): SiteTheme {
  const text = normalizeHex(theme?.text, defaultTheme.text);
  const accent = normalizeHex(theme?.accent, defaultTheme.accent);
  return {
    background: normalizeHex(theme?.background, defaultTheme.background),
    text,
    heading: normalizeHex(theme?.heading, text),
    muted: normalizeHex(theme?.muted, defaultTheme.muted),
    accent,
    button: normalizeHex(theme?.button, accent),
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function mix(from: string, to: string, amount: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  );
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function onColor(hex: string) {
  return luminance(hex) > 0.45 ? "#141414" : "#f7f4ef";
}

export function themeToStyle(theme: Partial<SiteTheme> | undefined): CSSProperties {
  const resolved = resolveTheme(theme);
  const light = luminance(resolved.background) > 0.45;
  const lift = light ? "#000000" : "#ffffff";
  const lowest = light
    ? mix(resolved.background, "#000000", 0.06)
    : mix(resolved.background, "#000000", 0.4);
  const low = mix(resolved.background, lift, light ? 0.035 : 0.045);
  const container = mix(resolved.background, lift, light ? 0.05 : 0.07);
  const high = mix(resolved.background, lift, light ? 0.08 : 0.11);
  const highest = mix(resolved.background, lift, light ? 0.12 : 0.16);

  return {
    "--color-background": resolved.background,
    "--color-surface": resolved.background,
    "--color-surface-dim": resolved.background,
    "--color-surface-bright": mix(resolved.background, lift, light ? 0.02 : 0.18),
    "--color-surface-container-lowest": lowest,
    "--color-surface-container-low": low,
    "--color-surface-container": container,
    "--color-surface-container-high": high,
    "--color-surface-container-highest": highest,
    "--color-surface-variant": high,
    "--color-primary": resolved.text,
    "--color-heading": resolved.heading,
    "--color-on-surface": resolved.text,
    "--color-on-background": resolved.text,
    "--color-on-primary": onColor(resolved.text),
    "--color-on-surface-variant": resolved.muted,
    "--color-outline": resolved.muted,
    "--color-outline-variant": mix(resolved.background, resolved.muted, 0.4),
    "--color-secondary": resolved.muted,
    "--color-secondary-container": mix(resolved.background, resolved.muted, 0.22),
    "--color-accent": resolved.accent,
    "--color-on-accent": onColor(resolved.accent),
    "--color-button": resolved.button,
    "--color-on-button": onColor(resolved.button),
  } as CSSProperties;
}
