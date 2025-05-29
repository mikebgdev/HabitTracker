import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Trash2, Globe, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
export default function Account() {
    const { user, signOut } = useAuth();
    const { t, language, setLanguage } = useI18n();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(language);
    const handleLanguageSelect = (newLanguage) => {
        setSelectedLanguage(newLanguage);
    };
    const handleSaveLanguage = () => {
        setLanguage(selectedLanguage);
        toast({
            title: t('common.success'),
            description: selectedLanguage === 'en'
                ? t('account.languageChangedEn')
                : t('account.languageChangedEs'),
        });
    };
    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: t('common.success'),
                description: t('auth.signOutSuccess'),
            });
        }
        catch (err) {
            toast({
                title: t('common.error'),
                description: t('auth.signOutError'),
            });
        }
    };
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            if (user)
                await user.delete();
            toast({
                title: t('common.success'),
                description: t('account.deletedSuccess'),
            });
        }
        catch (err) {
            toast({
                title: t('common.error'),
                description: t('account.deletedError'),
            });
        }
        finally {
            setIsDeleting(false);
        }
    };
    return (_jsx(Layout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: t('account.title') }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "w-5 h-5" }), t('account.language')] }), _jsx(CardDescription, { children: t('account.selectLanguage') })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Select, { value: selectedLanguage, onValueChange: handleLanguageSelect, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "en", children: t('account.english') }), _jsx(SelectItem, { value: "es", children: t('account.spanish') })] })] }), _jsx(Button, { onClick: handleSaveLanguage, disabled: selectedLanguage === language, size: "sm", children: t('common.save') })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('account.userInfo') }), _jsx(CardDescription, { children: t('account.userInfoDescription') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: t('account.email') }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: user?.email })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: t('account.name') }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: user?.displayName || t('account.notProvided') })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('account.actions') }), _jsx(CardDescription, { children: t('account.actionsDescription') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Button, { onClick: handleSignOut, variant: "outline", className: "flex items-center gap-2", children: [_jsx(LogOut, { className: "w-4 h-4" }), t('auth.signOut')] }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "destructive", className: "flex items-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), t('account.deleteAccount')] }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: t('account.confirmDelete') }), _jsx(AlertDialogDescription, { children: t('account.deleteWarning') })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: t('common.cancel') }), _jsx(AlertDialogAction, { onClick: handleDeleteAccount, disabled: isDeleting, className: "bg-red-600 hover:bg-red-700", children: isDeleting
                                                                ? t('common.loading')
                                                                : t('account.confirmDeleteButton') })] })] })] })] })] })] }) }));
}
