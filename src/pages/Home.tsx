import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';

export default function UnifiedAuthPage() {
  const { user, signIn } = useAuth();
  const { t } = useI18n();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      // Redirige si el usuario ya está autenticado
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignIn}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <LogIn className="w-5 h-5" />
              {t('auth.loginWithGoogle')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pantalla de bienvenida
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('auth.welcome')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t('auth.welcomeDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => setShowLogin(true)}>
            {t('auth.login')}
          </Button>
        </div>
      </div>
    </div>
  );
}
