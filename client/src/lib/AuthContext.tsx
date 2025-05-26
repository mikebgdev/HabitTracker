import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, handleRedirectResult } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result when component mounts
    handleRedirectResult()
      .then((result) => {
        if (result?.user) {
          console.log('Successfully signed in via redirect:', result.user);
          // Redirect to dashboard after successful login
          window.location.href = '/dashboard';
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // If user is authenticated and on login page, redirect to dashboard
      if (user && (window.location.pathname === '/' || window.location.pathname === '/login')) {
        window.location.href = '/dashboard';
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}