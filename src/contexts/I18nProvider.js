import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { I18nContext, getTranslation } from './i18n';
export function I18nProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved || 'en';
    });
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);
    const t = (key) => {
        return getTranslation(language, key);
    };
    const value = {
        language,
        setLanguage,
        t,
    };
    return _jsx(I18nContext.Provider, { value: value, children: children });
}
