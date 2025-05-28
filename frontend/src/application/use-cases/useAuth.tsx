import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/infrastructure/api/queryClient";
import type { User } from "@/shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {

        const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            'Authorization': storedToken ? `Bearer ${storedToken}` : ''
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
        rememberMe
      });
      
      const userData = await res.json();

      if (rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', userData.token);
      } else {

        sessionStorage.setItem('auth_user', JSON.stringify(userData));
        sessionStorage.setItem('auth_token', userData.token);
      }
      
      setUser(userData);
      setLocation("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        username,
        email,
        password,
      });
      
      const userData = await res.json();
      setUser(userData);
      setLocation("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/logout", {});

      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      setUser(null);
      setLocation("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
