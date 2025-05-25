import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sun, Moon, Menu, X, User, Home, Calendar, BarChart2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => {
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
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toggle theme
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/">
              <a className="text-xl font-bold text-blue-600 dark:text-blue-400">HabitMaster</a>
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
            
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 flex items-center"
            >
              <User size={16} className="mr-2" />
              <span>Profile</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            <NavItem 
              to="/" 
              icon={<Home size={20} />} 
              label="Dashboard" 
              isActive={location === '/'} 
            />
            <NavItem 
              to="/routines" 
              icon={<Calendar size={20} />} 
              label="My Routines" 
              isActive={location === '/routines'} 
            />
            <NavItem 
              to="/groups" 
              icon={<Layers size={20} />} 
              label="Groups" 
              isActive={location === '/groups'} 
            />
            <NavItem 
              to="/progress" 
              icon={<BarChart2 size={20} />} 
              label="Progress" 
              isActive={location === '/progress'} 
            />
          </nav>
        </aside>
        
        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75">
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Menu</h2>
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
                  label="Dashboard" 
                  isActive={location === '/'} 
                  onClick={closeMobileMenu}
                />
                <NavItem 
                  to="/routines" 
                  icon={<Calendar size={20} />} 
                  label="My Routines" 
                  isActive={location === '/routines'} 
                  onClick={closeMobileMenu}
                />
                <NavItem 
                  to="/groups" 
                  icon={<Layers size={20} />} 
                  label="Groups" 
                  isActive={location === '/groups'} 
                  onClick={closeMobileMenu}
                />
                <NavItem 
                  to="/progress" 
                  icon={<BarChart2 size={20} />} 
                  label="Progress" 
                  isActive={location === '/progress'} 
                  onClick={closeMobileMenu}
                />
              </nav>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;