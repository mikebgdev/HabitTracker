import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
export function MobileNavbar() {
    const [location] = useLocation();
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }
    };
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = "";
    };
    const navItems = [
        { path: "/", label: "Dashboard", icon: "fa-home" },
        { path: "/routines", label: "My Routines", icon: "fa-list-check" },
        { path: "/groups", label: "Groups", icon: "fa-layer-group" },
        { path: "/progress", label: "Progress", icon: "fa-chart-line" },
        { path: "/settings", label: "Settings", icon: "fa-gear" },
    ];
    const mobileNavItems = [
        { path: "/", label: "Home", icon: "fa-home" },
        { path: "/routines", label: "Routines", icon: "fa-list-check" },
        { path: "/groups", label: "Groups", icon: "fa-layer-group" },
        { path: "/progress", label: "Progress", icon: "fa-chart-line" },
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "md:hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "text-gray-500 mr-2", onClick: toggleMobileMenu, children: _jsx(Menu, { size: 20 }) }), _jsx("div", { className: "text-primary text-xl font-bold mr-2", children: _jsx("i", { className: "fas fa-check-circle" }) }), _jsx("h1", { className: "text-lg font-bold text-gray-900 dark:text-white", children: "HabitMaster" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: toggleTheme, className: "text-gray-500 dark:text-gray-400", children: theme === "dark" ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }), _jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { children: user?.displayName?.substring(0, 2).toUpperCase() }) })] })] }), isMobileMenuOpen && (_jsx("div", { className: "md:hidden fixed inset-0 z-20 bg-black bg-opacity-50", children: _jsxs("div", { className: "w-64 h-full bg-white dark:bg-gray-800 p-4 flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-center mb-5 pb-2 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "text-primary text-2xl font-bold mr-2", children: _jsx("i", { className: "fas fa-check-circle" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "HabitMaster" })] }), _jsx(Button, { variant: "ghost", size: "icon", className: "text-gray-500", onClick: closeMobileMenu, children: _jsx(X, { size: 18 }) })] }), _jsx("nav", { className: "flex-1 space-y-1", children: navItems.map((item) => (_jsx(Link, { href: item.path, children: _jsxs("a", { className: `flex items-center px-3 py-2 rounded-md ${location === item.path
                                        ? "bg-primary-50 dark:bg-primary/20 text-primary dark:text-primary-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`, onClick: closeMobileMenu, children: [_jsx("i", { className: `fas ${item.icon} w-5 h-5 mr-3` }), _jsx("span", { children: item.label })] }) }, item.path))) }), _jsx("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Avatar, { className: "h-8 w-8 mr-3", children: _jsx(AvatarFallback, { children: user?.displayName?.substring(0, 2).toUpperCase() }) }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: user?.displayName }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: user?.email })] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: signOut, className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300", children: _jsx("i", { className: "fas fa-sign-out-alt" }) })] }) })] }) })), _jsx("div", { className: "fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-10", children: _jsx("div", { className: "flex justify-around", children: mobileNavItems.map((item) => (_jsx(Link, { href: item.path, children: _jsxs("a", { className: `flex flex-col items-center p-2 ${location === item.path
                                ? "text-primary dark:text-primary-400"
                                : "text-gray-600 dark:text-gray-400"}`, children: [_jsx("i", { className: `fas ${item.icon} text-lg` }), _jsx("span", { className: "text-xs mt-1", children: item.label })] }) }, item.path))) }) })] }));
}
export default MobileNavbar;
