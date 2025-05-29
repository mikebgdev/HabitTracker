import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
export default function Home() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { t } = useI18n();
    useEffect(() => {
        if (user) {
            setLocation('/dashboard');
        }
    }, [user, setLocation]);
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(CheckCircle, { className: "h-16 w-16 text-blue-600 dark:text-blue-400" }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-4", children: t('auth.welcome') }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300 mb-8", children: t('auth.welcomeDescription') }), _jsx("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: _jsx(Button, { asChild: true, variant: "primary", size: "lg", children: _jsx(Link, { href: "/login", children: t('auth.login') }) }) })] }) }));
}
