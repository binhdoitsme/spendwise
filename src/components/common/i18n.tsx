"use client";
import React, { createContext, useContext, useMemo } from "react";

// Supported languages
export type Language = "en" | "vi";

export interface Localizable {
  language: Language;
}

// Context type
interface I18nContextType {
  language: Language;
  setLanguage?: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
});

export const I18nProvider: React.FC<{
  children: React.ReactNode;
  language?: Language;
}> = ({ children, language = "en" }) => {
  const value = useMemo(() => ({ language }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  return useContext(I18nContext);
}
