import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
export default function Login() {
    const { signIn } = useAuth();
    const { t } = useI18n();
    const handleSignIn = async () => {
        try {
            await signIn();
        }
        catch (error) {
            console.error('Failed to sign in:', error);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: t('auth.welcome') }), _jsx(CardDescription, { children: t('auth.loginDescription') })] }), _jsx(CardContent, { children: _jsxs(Button, { onClick: handleSignIn, className: "w-full flex items-center gap-2", size: "lg", children: [_jsx(LogIn, { className: "w-5 h-5" }), t('auth.loginWithGoogle')] }) })] }) }));
}
