import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/presentation/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/application/use-cases/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {

    if (user && !isLoading) {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);
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
          Bienvenido a tu aplicación personal de seguimiento de hábitos. Lleva un registro de tus rutinas diarias y construye mejores hábitos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/login">
              Iniciar sesión
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">
              Registrarse
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">
            Cómo empezar
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Para probar la aplicación, puedes iniciar sesión con estas credenciales:
          </p>
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-left inline-block">
            <p><strong>Usuario:</strong> demo</p>
            <p><strong>Contraseña:</strong> password</p>
          </div>
        </div>
      </div>
    </div>
  );
}