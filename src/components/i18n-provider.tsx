"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

/**
 * I18nProvider component that wraps the app with i18next provider.
 * This ensures i18n is initialized before any components use translations.
 * Prevents hydration mismatch by ensuring server and client use the same initial language.
 * Language detection happens only on client side after initial render.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.init();
    }
    
    // On client side, detect and change language if different from current
    // This happens after initial render to prevent hydration mismatch
    if (typeof window !== "undefined") {
      // Get language from localStorage first, then fallback to navigator
      const storedLang = localStorage.getItem("i18nextLng");
      const browserLang = navigator.language.split("-")[0];
      const detectedLang = storedLang || (browserLang === "ja" ? "ja" : "en");
      const finalLang = detectedLang === "ja" || detectedLang === "en" ? detectedLang : "en";
      
      // Only change if different from current language
      if (finalLang !== i18n.language) {
        i18n.changeLanguage(finalLang);
      }
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

