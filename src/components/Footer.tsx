"use client";

import Link from "next/link";
import { useSite } from "@/content/site-context";
import { MaterialIcon } from "./MaterialIcon";

const CREDIT_URL = "https://www.iarabaudinodev.com.ar";

type FooterIcon = "mail" | "phone" | "instagram" | "whatsapp" | "link";

function iconFor(label: string, href: string): FooterIcon {
  const haystack = `${label} ${href}`.toLowerCase();
  if (href.startsWith("mailto:") || haystack.includes("mail") || haystack.includes("correo")) {
    return "mail";
  }
  if (haystack.includes("whatsapp") || haystack.includes("wa.me")) return "whatsapp";
  if (
    href.startsWith("tel:") ||
    haystack.includes("teléfono") ||
    haystack.includes("telefono") ||
    haystack.includes("phone")
  ) {
    return "phone";
  }
  if (haystack.includes("instagram")) return "instagram";
  return "link";
}

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
  const items = links.map((link) => ({ ...link, icon: iconFor(link.label, link.href) }));

  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface">
      <div className="flex flex-col gap-1 px-margin-mobile py-2.5 md:px-margin-tablet md:py-3 lg:px-margin-desktop">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-between">
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            {photographer.name ? `${photographer.name} © ${year}` : `© ${year}`}
          </p>
          {items.length ? (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {items.map((link) => (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  aria-label={link.label}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="font-label-sm text-label-sm inline-flex items-center gap-1.5 tracking-widest text-on-surface-variant uppercase transition-colors hover:text-primary"
                >
                  <MaterialIcon name={link.icon} className="text-[14px]" />
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
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
