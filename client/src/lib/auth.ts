import { ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Protected route component that redirects to login if user is not authenticated
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // If still checking auth status, return nothing temporarily
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
