import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { loadTranslations, getNestedTranslation } from "@/lib/i18n";
const I18nContext = createContext(undefined);
export const I18nProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });
    const [translations, setTranslations] = useState({});
    useEffect(() => {
        loadTranslations(language).then(setTranslations);
    }, [language]);
    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
        setLanguageState(lang);
    };
    const t = (key, vars) => {
        let translation = getNestedTranslation(translations, key);
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                translation = translation.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
            });
        }
        return translation;
    };
    return (_jsx(I18nContext.Provider, { value: { language, t, setLanguage }, children: children }));
};
export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
};
