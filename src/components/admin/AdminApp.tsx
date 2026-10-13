"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SiteConfig } from "@/content/types";
import { logout, useAuthUser } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content";
import { AccountSection } from "./AccountSection";
import { AdminFeedbackContext } from "./admin-feedback";
import { AppearanceSection } from "./AppearanceSection";
import { BioSection } from "./BioSection";
import { ContactSection } from "./ContactSection";
import { EditImagesSection } from "./EditImagesSection";
import { IdentitySection } from "./IdentitySection";
import { InquiriesSection } from "./InquiriesSection";
import { UploadImagesSection } from "./UploadImagesSection";
import { cn } from "@/lib/cn";

const sections = [
  { id: "apariencia", label: "Apariencia" },
  { id: "identidad", label: "Identidad" },
  { id: "bio", label: "Bio" },
  { id: "contacto", label: "Contacto" },
  { id: "cargar", label: "Cargar imágenes" },
  { id: "editar", label: "Editar imágenes" },
  { id: "consultas", label: "Consultas" },
  { id: "cuenta", label: "Cuenta" },
] as const;

type SectionId = (typeof sections)[number]["id"];

const LEAVE_WARNING =
  "Tenés cambios sin guardar. Si salís ahora se pierden. ¿Querés salir igual?";

export function AdminApp() {
  const router = useRouter();
  const { user, loading, configured } = useAuthUser();
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [section, setSection] = useState<SectionId>("apariencia");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  }, []);

  const feedback = useMemo(() => ({ notify, setDirty }), [notify]);

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, configured, router]);

  useEffect(() => {
    if (configured && !user) return;
    void getSiteContent().then(setSite);
  }, [user, configured]);

  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function confirmLeave() {
    return !dirty || window.confirm(LEAVE_WARNING);
  }

  if (loading || !site || (configured && !user)) {
    return (
      <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
        Cargando panel…
      </p>
    );
  }

  return (
    <AdminFeedbackContext.Provider value={feedback}>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[14rem_1fr]">
        <aside className="flex flex-col gap-6">
          <nav className="flex flex-col gap-3">
            {sections
              .filter((item) => item.id !== "cuenta" || Boolean(user?.email))
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === section || !confirmLeave()) return;
                    setSection(item.id);
                  }}
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
                if (!confirmLeave()) return;
                await logout();
                router.replace("/admin/login");
              }}
              className="font-label-sm text-label-sm cursor-pointer text-left tracking-widest text-outline uppercase hover:text-primary"
            >
              Cerrar sesión
            </button>
          ) : null}
          <Link
            href="/"
            onClick={(event) => {
              if (!confirmLeave()) event.preventDefault();
            }}
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
          {section === "cargar" ? (
            <UploadImagesSection
              site={site}
              onSaved={setSite}
              onGoToEdit={() => setSection("editar")}
            />
          ) : null}
          {section === "editar" ? (
            <EditImagesSection site={site} onSaved={setSite} />
          ) : null}
          {section === "consultas" ? <InquiriesSection /> : null}
          {section === "cuenta" && user?.email ? (
            <AccountSection email={user.email} />
          ) : null}
        </section>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-300",
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        {toast ? (
          <p
            role="status"
            className="font-label-sm text-label-sm bg-button px-5 py-3 tracking-widest text-on-button uppercase shadow-lg"
          >
            {toast}
          </p>
        ) : null}
      </div>
    </AdminFeedbackContext.Provider>
  );
}
