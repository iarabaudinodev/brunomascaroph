"use client";

import { createContext, useContext, useEffect } from "react";

type AdminFeedback = {
  notify: (message: string) => void;
  setDirty: (dirty: boolean) => void;
};

export const AdminFeedbackContext = createContext<AdminFeedback>({
  notify: () => {},
  setDirty: () => {},
});

export function useAdminFeedback() {
  return useContext(AdminFeedbackContext);
}

/** Informa al panel si la sección tiene cambios sin guardar. */
export function useUnsavedChanges(dirty: boolean) {
  const { setDirty } = useAdminFeedback();

  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
}

export function isSameContent(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}
