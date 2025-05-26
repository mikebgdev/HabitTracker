import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from './firebase';

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
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result?.user) {
        console.log('Successfully signed in with popup:', result.user);
        
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
            
            // Save the JWT token to localStorage
            if (data.token) {
              localStorage.setItem('authToken', data.token);
            }
            
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
          } else {
            console.error('Failed to save user to database');
          }
        } catch (error) {
          console.error('Error saving user to database:', error);
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      // Clear the JWT token from localStorage
      localStorage.removeItem('authToken');
      // Redirect to login page after logout
      window.location.href = '/';
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