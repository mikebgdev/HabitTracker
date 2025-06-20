import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart2,
  Calendar,
  CheckCircle,
  Home,
  Layers,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nProvider';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <Link href={to}>
      <a
        className={`flex items-center p-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
        onClick={onClick}
      >
        <div className="mr-3">{icon}</div>
        <span>{label}</span>
      </a>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { t } = useI18n();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/dashboard">
              <a className="text-xl font-bold text-blue-600 flex">
                <CheckCircle className="text-blue-600 mt-1 mr-2" />
                {t('common.appName')}
              </a>
            </Link>
          </div>

          <div className="flex items-center">
            <button
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link href="/account">
              <a className="ml-4 flex items-center border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                <User size={16} className="mr-2" />
                <span>{t('nav.account')}</span>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            <NavItem
              to="/dashboard"
              icon={<Home size={20} />}
              label={t('nav.dashboard')}
              isActive={location === '/dashboard' || location === '/'}
            />
            <NavItem
              to="/routines"
              icon={<Calendar size={20} />}
              label={t('nav.routines')}
              isActive={location === '/routines'}
            />
            <NavItem
              to="/groups"
              icon={<Layers size={20} />}
              label={t('nav.groups')}
              isActive={location === '/groups'}
            />
            <NavItem
              to="/progress"
              icon={<BarChart2 size={20} />}
              label={t('nav.progress')}
              isActive={location === '/progress'}
            />
          </nav>
        </aside>

        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75">
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {t('nav.menu')}
                </h2>
                <button
                  onClick={closeMobileMenu}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                <NavItem
                  to="/"
                  icon={<Home size={20} />}
                  label={t('nav.dashboard')}
                  isActive={location === '/'}
                  onClick={closeMobileMenu}
                />
                <NavItem
                  to="/routines"
                  icon={<Calendar size={20} />}
                  label={t('nav.routines')}
                  isActive={location === '/routines'}
                  onClick={closeMobileMenu}
                />
                <NavItem
                  to="/groups"
                  icon={<Layers size={20} />}
                  label={t('nav.groups')}
                  isActive={location === '/groups'}
                  onClick={closeMobileMenu}
                />
                <NavItem
                  to="/progress"
                  icon={<BarChart2 size={20} />}
                  label={t('nav.progress')}
                  isActive={location === '/progress'}
                  onClick={closeMobileMenu}
                />
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
