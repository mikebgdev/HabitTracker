import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
export default function UnifiedAuthPage() {
    const { user, signIn } = useAuth();
    const { t } = useI18n();
    const [showLogin, setShowLogin] = useState(false);
    useEffect(() => {
        if (user) {
            // Redirige si el usuario ya está autenticado
            window.location.href = '/dashboard';
        }
    }, [user]);
    const handleSignIn = async () => {
        try {
            await signIn();
        }
        catch (error) {
            console.error('Failed to sign in:', error);
        }
    };
    if (showLogin) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: t('auth.welcome') }), _jsx(CardDescription, { children: t('auth.loginDescription') })] }), _jsx(CardContent, { children: _jsxs(Button, { onClick: handleSignIn, className: "w-full flex items-center gap-2", size: "lg", children: [_jsx(LogIn, { className: "w-5 h-5" }), t('auth.loginWithGoogle')] }) })] }) }));
    }
    // Pantalla de bienvenida
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", children: _jsxs("div", { className: "max-w-3xl mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(CheckCircle, { className: "h-16 w-16 text-blue-600 dark:text-blue-400" }) }), _jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-4", children: t('auth.welcome') }), _jsx("p", { className: "text-lg text-gray-600 dark:text-gray-300 mb-8", children: t('auth.welcomeDescription') }), _jsx("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: _jsx(Button, { variant: "primary", size: "lg", onClick: () => setShowLogin(true), children: t('auth.login') }) })] }) }));
}
