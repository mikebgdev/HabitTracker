import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNavbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-home' },
    { path: '/routines', label: 'My Routines', icon: 'fa-list-check' },
    { path: '/groups', label: 'Groups', icon: 'fa-layer-group' },
    { path: '/progress', label: 'Progress', icon: 'fa-chart-line' },
    { path: '/settings', label: 'Settings', icon: 'fa-gear' },
  ];

  const mobileNavItems = [
    { path: '/dashboard', label: 'Home', icon: 'fa-home' },
    { path: '/routines', label: 'Routines', icon: 'fa-list-check' },
    { path: '/groups', label: 'Groups', icon: 'fa-layer-group' },
    { path: '/progress', label: 'Progress', icon: 'fa-chart-line' },
  ];

  const userInitials = user?.displayName?.substring(0, 2).toUpperCase() || 'U';

  return (
    <>
      <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 mr-2"
            onClick={toggleMobileMenu}
          >
            <Menu size={20} />
          </Button>
          <div className="text-primary text-xl font-bold mr-2">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            HabitTracker
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
          <div className="w-64 h-full bg-white dark:bg-gray-800 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="text-primary text-2xl font-bold mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  HabitTracker
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500"
                onClick={closeMobileMenu}
              >
                <X size={18} />
              </Button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md ${
                      location === item.path
                        ? 'bg-primary-50 dark:bg-primary/20 text-primary dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <i className={`fas ${item.icon} w-5 h-5 mr-3`}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-10">
        <div className="flex justify-around">
          {mobileNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex flex-col items-center p-2 ${
                  location === item.path
                    ? 'text-primary dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <i className={`fas ${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default MobileNavbar;
