import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/i18n";
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { t } = useI18n();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900", children: _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: t('common.loading') }) }));
    }
    if (!user) {
        return _jsx(Redirect, { to: "/login" });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
