import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            HabitMaster
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Bienvenido a tu aplicación personal de seguimiento de hábitos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </div>
  );
}
