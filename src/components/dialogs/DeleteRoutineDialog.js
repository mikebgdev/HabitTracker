import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { useI18n } from '@/contexts/I18nProvider';
export function DeleteRoutineDialog({ open, onOpenChange, onConfirm, routineName = "esta rutina" }) {
    const { t } = useI18n();
    return (_jsx(AlertDialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: t('routines.confirmDeleteTitle') }), _jsx(AlertDialogDescription, { children: t('routines.confirmDeleteDesc', { routineName }) })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: t('common.cancel') }), _jsx(AlertDialogAction, { onClick: onConfirm, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: t('routines.confirmDeleteBtn') })] })] }) }));
}
