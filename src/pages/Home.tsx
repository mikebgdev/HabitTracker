import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, LogIn } from 'lucide-react';

export default function Home() {
  const { user, signIn } = useAuth();
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
      {/* Header */}
      <header className="flex justify-between items-center py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">HabitMaster</h1>
        {!showLogin && (
          <Button
            onClick={() => setShowLogin(true)}
            className="rounded-full px-6"
          >
            Sign In
          </Button>
        )}
      </header>

      {/* Main content */}
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
                Build better{' '}
                <span className="text-black dark:text-white">habits,</span>{' '}
                <span className="text-blue-600">one day at a time</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                HabitMaster helps you build consistent habits with beautiful
                visuals, smart reminders, and real progress tracking.
              </p>
              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Get Started <ArrowRight className="ml-2" />
              </Button>

              {/* Feature Section */}
              <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left px-4">
                {[
                  'Track daily, weekly, or custom habits',
                  'Progress tracking and streaks',
                  'Beautiful habit heatmaps',
                  'Smart reminders and notifications',
                  'Detailed analytics and insights',
                  'Goal setting and motivation',
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start gap-4"
                  >
                    <CheckCircle className="text-blue-600 mt-1" />
                    <p className="text-gray-700 dark:text-gray-300">
                      {feature}
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
                Welcome to HabitMaster
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Sign in to start tracking your habits
              </p>
              <Button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 text-lg"
                size="lg"
              >
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </Button>
              <p
                onClick={() => setShowLogin(false)}
                className="text-sm text-blue-500 hover:underline mt-6 text-center cursor-pointer"
              >
                ← Back to home
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
