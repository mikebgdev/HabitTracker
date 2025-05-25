import { useState, useEffect, ReactNode } from 'react';
import { I18nContext, Language, getTranslation, TranslationKeys } from './i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof TranslationKeys): string => {
    return getTranslation(language, key);
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}