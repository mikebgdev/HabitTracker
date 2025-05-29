import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return children;
};

export default ProtectedRoute;
