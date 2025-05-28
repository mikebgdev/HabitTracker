import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sun, Moon, Menu, X, User, Home, Calendar, BarChart2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/i18n';
const NavItem = ({ to, icon, label, isActive, onClick }) => {
    return (_jsx(Link, { href: to, children: _jsxs("a", { className: `flex items-center p-2 rounded-lg transition-colors ${isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`, onClick: onClick, children: [_jsx("div", { className: "mr-3", children: icon }), _jsx("span", { children: label })] }) }));
};
const Layout = ({ children }) => {
    const [location] = useLocation();
    const { t } = useI18n();
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors", children: [_jsx("header", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm", children: _jsxs("div", { className: "container mx-auto px-4 py-3 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { className: "md:hidden mr-4 text-gray-600 dark:text-gray-300", onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), children: isMobileMenuOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }), _jsx(Link, { href: "/", children: _jsx("a", { className: "text-xl font-bold text-blue-600 dark:text-blue-400", children: "HabitMaster" }) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("button", { className: "p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full", onClick: toggleTheme, "aria-label": "Toggle theme", children: isDarkMode ? _jsx(Sun, { size: 20 }) : _jsx(Moon, { size: 20 }) }), _jsx(Link, { href: "/account", children: _jsxs(Button, { variant: "outline", size: "sm", className: "ml-4 flex items-center", children: [_jsx(User, { size: 16, className: "mr-2" }), _jsx("span", { children: "Profile" })] }) })] })] }) }), _jsxs("div", { className: "flex flex-1", children: [_jsx("aside", { className: "hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4", children: _jsxs("nav", { className: "space-y-2", children: [_jsx(NavItem, { to: "/dashboard", icon: _jsx(Home, { size: 20 }), label: t('nav.dashboard'), isActive: location === '/dashboard' || location === '/' }), _jsx(NavItem, { to: "/routines", icon: _jsx(Calendar, { size: 20 }), label: t('nav.routines'), isActive: location === '/routines' }), _jsx(NavItem, { to: "/groups", icon: _jsx(Layers, { size: 20 }), label: t('nav.groups'), isActive: location === '/groups' }), _jsx(NavItem, { to: "/progress", icon: _jsx(BarChart2, { size: 20 }), label: t('nav.progress'), isActive: location === '/progress' })] }) }), isMobileMenuOpen && (_jsx("div", { className: "md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75", children: _jsxs("div", { className: "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-bold text-blue-600 dark:text-blue-400", children: "Menu" }), _jsx("button", { onClick: closeMobileMenu, className: "text-gray-600 dark:text-gray-300", children: _jsx(X, { size: 24 }) })] }), _jsxs("nav", { className: "space-y-2", children: [_jsx(NavItem, { to: "/", icon: _jsx(Home, { size: 20 }), label: "Dashboard", isActive: location === '/', onClick: closeMobileMenu }), _jsx(NavItem, { to: "/routines", icon: _jsx(Calendar, { size: 20 }), label: "My Routines", isActive: location === '/routines', onClick: closeMobileMenu }), _jsx(NavItem, { to: "/groups", icon: _jsx(Layers, { size: 20 }), label: "Groups", isActive: location === '/groups', onClick: closeMobileMenu }), _jsx(NavItem, { to: "/progress", icon: _jsx(BarChart2, { size: 20 }), label: "Progress", isActive: location === '/progress', onClick: closeMobileMenu })] })] }) })), _jsx("main", { className: "flex-1 p-4 md:p-6 overflow-auto", children: children })] })] }));
};
export default Layout;
