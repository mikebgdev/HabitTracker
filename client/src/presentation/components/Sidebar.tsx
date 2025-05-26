import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/presentation/components/ui/avatar";
import { Button } from "@/presentation/components/ui/button";
import { useTheme } from "@/presentation/components/ThemeProvider";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/application/use-cases/useAuth";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fa-home" },
    { path: "/routines", label: "My Routines", icon: "fa-list-check" },
    { path: "/groups", label: "Groups", icon: "fa-layer-group" },
    { path: "/progress", label: "Progress", icon: "fa-chart-line" },
    { path: "/settings", label: "Settings", icon: "fa-gear" },
  ];

  return (
    <aside
      className={`hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${className}`}
    >
      <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="text-primary text-2xl font-bold mr-2">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">HabitMaster</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex items-center px-3 py-2 rounded-md ${
                location === item.path
                  ? "bg-primary-50 dark:bg-primary/20 text-primary dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <i className={`fas ${item.icon} w-5 h-5 mr-3`}></i>
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback>
              {user?.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
