"use client";

import { FormEvent, useState } from "react";
import { changePassword, passwordErrorMessage } from "@/lib/auth";
import { AdminButton, AdminField } from "./fields";

export function AccountSection({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (nextPassword.length < 6) {
      setError("La nueva contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError("La repetición no coincide con la nueva contraseña.");
      return;
    }
    if (nextPassword === currentPassword) {
      setError("Elegí una contraseña distinta a la actual.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setMessage("Contraseña actualizada.");
    } catch (err) {
      setError(passwordErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex max-w-md flex-col gap-8" onSubmit={onSubmit}>
      <div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          La sesión sigue abierta. La próxima vez vas a entrar con la contraseña nueva.
        </p>
        <p className="font-label-sm text-label-sm mt-4 tracking-widest text-outline uppercase">
          {email}
        </p>
      </div>
      <AdminField label="Contraseña actual" htmlFor="current-password">
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          className="field-input"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </AdminField>
      <AdminField label="Nueva contraseña" htmlFor="next-password">
        <input
          id="next-password"
          type="password"
          required
          autoComplete="new-password"
          className="field-input"
          value={nextPassword}
          onChange={(event) => setNextPassword(event.target.value)}
        />
      </AdminField>
      <AdminField label="Repetir nueva contraseña" htmlFor="confirm-password">
        <input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          className="field-input"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </AdminField>
      <div className="flex items-center justify-between gap-4">
        <AdminButton type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Cambiar contraseña"}
        </AdminButton>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {error ? <span className="text-error">{error}</span> : message}
        </span>
      </div>
    </form>
  );
}
