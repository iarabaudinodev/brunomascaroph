"use client";

import Link from "next/link";
import { useSite } from "@/content/site-context";

const CREDIT_URL = "https://www.iarabaudinodev.com.ar";

function externalHref(href: string) {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value.replace(/^\/\//, "")}`;
}

export function Footer() {
  const site = useSite();
  const year = new Date().getFullYear();
  const { photographer } = site;
  const phone = photographer.phone?.trim() ?? "";
  const links = [
    phone
      ? { label: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` }
      : null,
    photographer.email
      ? { label: "Email", href: `mailto:${photographer.email}` }
      : null,
    photographer.instagramUrl
      ? {
          label: photographer.instagram.trim() || "Instagram",
          href: externalHref(photographer.instagramUrl),
        }
      : null,
    ...(photographer.links ?? [])
      .filter((link) => link.label.trim() && link.href.trim())
      .map((link) => ({
        label: link.label.trim(),
        href: externalHref(link.href),
      })),
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface">
      <div className="flex flex-col gap-1 px-margin-mobile py-2.5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-margin-tablet md:py-3 lg:px-margin-desktop">
        <p className="font-label-sm text-label-sm text-center tracking-widest text-outline uppercase md:text-left">
          {photographer.name ? `${photographer.name} © ${year}` : `© ${year}`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
          {links.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href={CREDIT_URL}
            target="_blank"
            rel="noreferrer"
            className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase transition-colors hover:text-primary"
          >
            Desarrollo Iara Baudino
          </a>
          <Link
            href="/admin"
            className="font-label-sm text-label-sm tracking-widest text-outline uppercase transition-colors hover:text-primary"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
