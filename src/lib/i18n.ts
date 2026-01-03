import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "@/locales/en.json";
import jaTranslations from "@/locales/ja.json";

// Initialize i18n with default language to prevent hydration mismatch
// Language detection will be handled in I18nProvider on client side only
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
    ja: {
      translation: jaTranslations,
    },
  },
  fallbackLng: "en",
  supportedLngs: ["en", "ja"],
  lng: "en", // Set default language explicitly to prevent hydration mismatch
  interpolation: {
    escapeValue: false,
  },
  pluralSeparator: "_",
  contextSeparator: "_",
});

export default i18n;

