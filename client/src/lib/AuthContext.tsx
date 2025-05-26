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
      .then(async (result) => {
        if (result?.user) {
          console.log('Successfully signed in via redirect:', result.user);
          
          // Create user in our database
          try {
            const response = await fetch('/api/auth/google-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: result.user.email,
                displayName: result.user.displayName,
                uid: result.user.uid,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              console.log('User saved to database:', data);
              // Redirect to dashboard after successful login
              window.location.href = '/dashboard';
            } else {
              console.error('Failed to save user to database');
            }
          } catch (error) {
            console.error('Error saving user to database:', error);
          }
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      // If user is authenticated and on login page, create/sync user and redirect
      if (user && (window.location.pathname === '/' || window.location.pathname === '/login')) {
        try {
          const response = await fetch('/api/auth/google-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              displayName: user.displayName,
              uid: user.uid,
            }),
          });

          if (response.ok) {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
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