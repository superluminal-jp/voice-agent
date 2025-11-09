"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

/**
 * I18nProvider component that wraps the app with i18next provider.
 * This ensures i18n is initialized before any components use translations.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

