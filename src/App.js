import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import MyRoutines from "@/pages/MyRoutines";
import Groups from "@/pages/Groups";
import ProgressPage from "@/pages/Progress";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
function App() {
    return (_jsx(I18nProvider, { children: _jsxs(AuthProvider, { children: [_jsx(Toaster, {}), _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/login", component: Login }), _jsx(Route, { path: "/dashboard", children: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/routines", children: _jsx(ProtectedRoute, { children: _jsx(MyRoutines, {}) }) }), _jsx(Route, { path: "/groups", children: _jsx(ProtectedRoute, { children: _jsx(Groups, {}) }) }), _jsx(Route, { path: "/progress", children: _jsx(ProtectedRoute, { children: _jsx(ProgressPage, {}) }) }), _jsx(Route, { path: "/account", children: _jsx(ProtectedRoute, { children: _jsx(Account, {}) }) }), _jsx(Route, { component: NotFound })] })] }) }));
}
export default App;
