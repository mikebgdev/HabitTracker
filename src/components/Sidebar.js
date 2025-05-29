import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
export function Sidebar({ className }) {
    const [location] = useLocation();
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'fa-home' },
        { path: '/routines', label: 'My Routines', icon: 'fa-list-check' },
        { path: '/groups', label: 'Groups', icon: 'fa-layer-group' },
        { path: '/progress', label: 'Progress', icon: 'fa-chart-line' },
        { path: '/settings', label: 'Settings', icon: 'fa-gear' },
    ];
    return (_jsxs("aside", { className: `hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${className}`, children: [_jsxs("div", { className: "p-4 flex items-center border-b border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-primary text-2xl font-bold mr-2", children: _jsx("i", { className: "fas fa-check-circle" }) }), _jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "HabitMaster" })] }), _jsx("nav", { className: "flex-1 p-4 space-y-1", children: navItems.map(({ path, label, icon }) => (_jsx(Link, { href: path, children: _jsxs("a", { className: `flex items-center px-3 py-2 rounded-md ${location === path
                            ? 'bg-primary-50 dark:bg-primary/20 text-primary dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`, children: [_jsx("i", { className: `fas ${icon} w-5 h-5 mr-3` }), _jsx("span", { children: label })] }) }, path))) }), _jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Avatar, { className: "h-8 w-8 mr-3", children: _jsx(AvatarFallback, { children: user?.displayName?.substring(0, 2).toUpperCase() }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: user?.displayName }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: user?.email })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: toggleTheme, className: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", children: theme === 'dark' ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: signOut, className: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300", children: _jsx(LogOut, { size: 18 }) })] })] }) })] }));
}
export default Sidebar;
