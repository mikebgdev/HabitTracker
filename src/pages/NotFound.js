import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'wouter';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nProvider';
export default function NotFound() {
    const { t } = useI18n();
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(AlertTriangle, { className: "h-24 w-24 text-yellow-500" }) }), _jsx("h1", { className: "text-5xl font-bold text-gray-900 dark:text-white mb-4", children: "404" }), _jsx("h2", { className: "text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2", children: t('notFound.title') }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 max-w-md mx-auto", children: t('notFound.description') })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx(Button, { asChild: true, variant: "outline", children: _jsxs(Link, { href: "/", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), t('notFound.backHome')] }) }), _jsx(Button, { asChild: true, variant: "primary", children: _jsx("a", { href: "https://habitmaster.replit.app/help", target: "_blank", rel: "noopener noreferrer", children: t('notFound.help') }) })] })] }));
}
