"use client";

import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseApp, isFirebaseConfigured } from "./firebase-app";

export function getClientAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setUser(null);
      return;
    }

    return onAuthStateChanged(auth, setUser);
  }, []);

  return {
    user,
    loading: user === undefined,
    configured: isFirebaseConfigured(),
  };
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getClientAuth();
  if (!auth) {
    throw new Error("Firebase no está configurado.");
  }
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  const auth = getClientAuth();
  if (!auth) return;
  await signOut(auth);
}

export async function changePassword(currentPassword: string, nextPassword: string) {
  const auth = getClientAuth();
  const user = auth?.currentUser;
  if (!auth || !user?.email) {
    throw new Error("Tenés que iniciar sesión para cambiar la contraseña.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, nextPassword);
}

export function passwordErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-login-credentials"
  ) {
    return "La contraseña actual no coincide.";
  }
  if (code === "auth/weak-password") {
    return "La nueva contraseña tiene que tener al menos 6 caracteres.";
  }
  if (code === "auth/too-many-requests") {
    return "Demasiados intentos. Probá más tarde.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "No se pudo cambiar la contraseña.";
}
