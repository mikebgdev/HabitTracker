import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, LogIn } from 'lucide-react';

export default function Home() {
  const { user, signIn } = useAuth();
  const { t } = useI18n();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fbfd] dark:bg-gray-900 text-gray-900 dark:text-white px-4 sm:px-6">
      <header className="flex justify-between items-center py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 flex">
          <CheckCircle className="text-blue-600 mt-1 mr-2" />
          {t('common.appName')}
        </h1>
        {!showLogin && (
          <Button
            onClick={() => setShowLogin(true)}
            className="rounded-full px-6"
          >
            {t('auth.login')}
          </Button>
        )}
      </header>

      <main className="max-w-5xl mx-auto text-center pt-12 pb-24">
        <AnimatePresence mode="wait">
          {!showLogin ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                {t('home.hero.part1')}{' '}
                <span className="text-black dark:text-white">
                  {t('home.hero.highlightHabit')}
                </span>{' '}
                <span className="text-blue-600">
                  {t('home.hero.highlightTime')}
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                {t('home.heroSubtitle')}
              </p>
              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                {t('home.getStarted')} <ArrowRight className="ml-2" />
              </Button>

              <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left px-4">
                {[
                  'trackHabits',
                  'progressTracking',
                  'heatmap',
                  'smartReminders',
                  'analytics',
                  'goalSetting',
                ].map((key, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start gap-4"
                  >
                    <CheckCircle className="text-blue-600 mt-1" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {t(`home.features.${key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md mx-auto"
            >
              <h3 className="text-2xl font-bold mb-2 text-blue-600 text-center">
                {t('auth.welcome')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                {t('auth.loginDescription')}
              </p>
              <Button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 text-lg"
                size="lg"
              >
                <LogIn className="w-5 h-5" />
                {t('auth.loginWithGoogle')}
              </Button>
              <p
                onClick={() => setShowLogin(false)}
                className="text-sm text-blue-500 hover:underline mt-6 text-center cursor-pointer"
              >
                {t('home.backToHome')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
