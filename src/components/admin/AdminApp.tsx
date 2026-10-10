"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SiteConfig } from "@/content/types";
import { logout, useAuthUser } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content";
import { AccountSection } from "./AccountSection";
import { AppearanceSection } from "./AppearanceSection";
import { BioSection } from "./BioSection";
import { CategoriesSection } from "./CategoriesSection";
import { ContactSection } from "./ContactSection";
import { IdentitySection } from "./IdentitySection";
import { InquiriesSection } from "./InquiriesSection";
import { WorksSection } from "./WorksSection";
import { cn } from "@/lib/cn";

const sections = [
  { id: "apariencia", label: "Apariencia" },
  { id: "identidad", label: "Identidad" },
  { id: "bio", label: "Bio" },
  { id: "contacto", label: "Contacto" },
  { id: "categorias", label: "Categorías" },
  { id: "obras", label: "Obras" },
  { id: "consultas", label: "Consultas" },
  { id: "cuenta", label: "Cuenta" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AdminApp() {
  const router = useRouter();
  const { user, loading, configured } = useAuthUser();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [section, setSection] = useState<SectionId>("apariencia");

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, configured, router]);

  useEffect(() => {
    if (configured && !user) return;
    void getSiteContent().then(setSite);
  }, [user, configured]);

  if (loading || !site || (configured && !user)) {
    return (
      <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
        Cargando panel…
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[14rem_1fr]">
      <aside className="flex flex-col gap-6">
        <nav className="flex flex-col gap-3">
          {sections
            .filter((item) => item.id !== "cuenta" || Boolean(user?.email))
            .map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                "font-label-md text-label-md cursor-pointer text-left tracking-widest uppercase transition-colors",
                section === item.id
                  ? "text-primary underline decoration-1 underline-offset-8"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {configured ? (
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/admin/login");
            }}
            className="font-label-sm text-label-sm cursor-pointer text-left tracking-widest text-outline uppercase hover:text-primary"
          >
            Cerrar sesión
          </button>
        ) : (
          <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            
          </p>
        )}
        <Link
          href="/"
          className="font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase hover:text-primary"
        >
          Ver sitio
        </Link>
      </aside>

      <section>
        {section === "apariencia" ? (
          <AppearanceSection site={site} onSaved={setSite} />
        ) : null}
        {section === "identidad" ? (
          <IdentitySection site={site} onSaved={setSite} />
        ) : null}
        {section === "bio" ? <BioSection site={site} onSaved={setSite} /> : null}
        {section === "contacto" ? (
          <ContactSection site={site} onSaved={setSite} />
        ) : null}
        {section === "categorias" ? (
          <CategoriesSection site={site} onSaved={setSite} />
        ) : null}
        {section === "obras" ? <WorksSection site={site} onSaved={setSite} /> : null}
        {section === "consultas" ? <InquiriesSection /> : null}
        {section === "cuenta" && user?.email ? (
          <AccountSection email={user.email} />
        ) : null}
      </section>
    </div>
  );
}
