"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, useAuthUser } from "@/lib/auth";
import { AdminButton, AdminField } from "./fields";

export function AdminLogin() {
  const router = useRouter();
  const { user, loading, configured } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (user || !configured)) {
      router.replace("/admin");
    }
  }, [loading, user, configured, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      router.replace("/admin");
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="max-w-xl">
        <h1 className="font-headline-lg text-headline-lg-mobile mb-6 text-primary">
          Modo local
        </h1>
        <p className="font-body-md text-body-md mb-8 text-on-surface-variant">
          Firebase todavía no está configurado. Podés usar el panel igual: los
          cambios quedan en este navegador.
        </p>
        <AdminButton onClick={() => router.replace("/admin")}>
          Abrir panel
        </AdminButton>
      </div>
    );
  }

  return (
    <form className="flex max-w-md flex-col gap-8" onSubmit={onSubmit}>
      <div>
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
          Panel
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile mt-2 text-primary">
          Entrar
        </h1>
      </div>
      <AdminField label="Email" htmlFor="admin-email">
        <input
          id="admin-email"
          type="email"
          required
          className="field-input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </AdminField>
      <AdminField label="Contraseña" htmlFor="admin-password">
        <input
          id="admin-password"
          type="password"
          required
          className="field-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </AdminField>
      <div className="flex items-center justify-between">
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? "Ingresando…" : "Ingresar"}
        </AdminButton>
        {error ? (
          <span className="font-label-sm text-label-sm text-error">{error}</span>
        ) : null}
      </div>
    </form>
  );
}
