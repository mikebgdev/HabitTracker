import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadTranslations, getNestedTranslation, Language, Translations } from "@/lib/i18n";

interface I18nContextValue {
  language: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
}


const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(translations, key);

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
      });
    }

    return translation;
  };


  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
