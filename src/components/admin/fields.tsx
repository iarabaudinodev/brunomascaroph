"use client";

import { useState, type ReactNode } from "react";
import { deleteFiles, uploadFile } from "@/lib/upload";
import { cn } from "@/lib/cn";

export function AdminField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-label-sm text-label-sm tracking-widest text-outline uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function AdminButton({
  children,
  type = "button",
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-label-md text-label-md cursor-pointer px-6 py-3 tracking-[0.16em] uppercase transition-all duration-300 disabled:cursor-wait disabled:opacity-60",
        variant === "primary" &&
          "bg-button text-on-button hover:bg-surface hover:text-primary hover:outline hover:outline-1 hover:outline-primary",
        variant === "ghost" &&
          "text-on-surface-variant hover:text-primary",
        variant === "danger" &&
          "text-error hover:underline",
      )}
    >
      {children}
    </button>
  );
}

export function ImageField({
  label,
  value,
  folder,
  retainUrl,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/avif",
  onChange,
}: {
  label: string;
  value: string;
  folder: string;
  retainUrl?: string;
  accept?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadFile(file, folder);
      if (value && value !== url && value !== retainUrl) {
        void deleteFiles([value]).catch(() => {
          setError("Se reemplazó la imagen, pero la anterior sigue en el almacenamiento.");
        });
      }
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminField label={label}>
      <label className="font-label-sm text-label-sm inline-flex cursor-pointer tracking-widest text-primary uppercase hover:opacity-80">
        {busy ? "Subiendo…" : "Elegir archivo"}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {error ? (
        <span className="font-label-sm text-label-sm text-error">{error}</span>
      ) : null}
      {value ? (
        <div className="mt-3 flex items-end gap-4">
          <div className="relative h-32 w-48 overflow-hidden bg-surface-container-lowest">
            {/* preview de admin */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-contain" />
          </div>
          <button
            type="button"
            className="font-label-sm text-label-sm cursor-pointer tracking-widest text-outline uppercase hover:text-primary"
            onClick={() => {
              const current = value;
              onChange("");
              if (current && current !== retainUrl) {
                void deleteFiles([current]).catch(() => {
                  setError("Se quitó del formulario, pero el archivo sigue guardado.");
                });
              }
            }}
          >
            Quitar
          </button>
        </div>
      ) : null}
    </AdminField>
  );
}

export function SaveRow({
  onSave,
  saving,
  message,
}: {
  onSave: () => void;
  saving: boolean;
  message: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <AdminButton onClick={onSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </AdminButton>
      <span className="font-label-sm text-label-sm tracking-widest text-on-surface-variant">
        {message}
      </span>
    </div>
  );
}
