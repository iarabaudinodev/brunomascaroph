"use client";

import { useEffect } from "react";
import { themeToStyle } from "@/content/theme";
import { subscribeSiteContent } from "@/lib/site-content";

export function ThemeSync() {
  useEffect(() => {
    return subscribeSiteContent((site) => {
      const style = themeToStyle(site.theme);
      const root = document.documentElement;
      for (const [key, value] of Object.entries(style)) {
        if (typeof value === "string") root.style.setProperty(key, value);
      }
    });
  }, []);

  return null;
}
