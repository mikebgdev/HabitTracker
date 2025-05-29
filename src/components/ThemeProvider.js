import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => { },
});
export function ThemeProvider({ children, defaultTheme = 'system', }) {
    const [theme, setThemeState] = useState(() => {
        const stored = localStorage.getItem('theme');
        return stored === 'dark' || stored === 'light' || stored === 'system'
            ? stored
            : defaultTheme;
    });
    // Apply theme to <html>
    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = (t) => {
            root.classList.remove('light', 'dark');
            if (t === 'system') {
                const systemPref = window.matchMedia('(prefers-color-scheme: dark)')
                    .matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemPref);
            }
            else {
                root.classList.add(t);
            }
        };
        applyTheme(theme);
    }, [theme]);
    // Respond to system theme changes
    useEffect(() => {
        if (theme !== 'system')
            return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const newTheme = media.matches ? 'dark' : 'light';
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newTheme);
        };
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, [theme]);
    const setTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);
    };
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme }, children: children }));
}
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
