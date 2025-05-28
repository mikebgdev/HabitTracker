import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-24 w-24 text-yellow-500" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          La página que estás buscando no existe o ha sido movida a otra ubicación.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
        
        <Button asChild variant="primary">
          <a href="https://habitmaster.replit.app/help" target="_blank" rel="noopener noreferrer">
            ¿Necesitas ayuda?
          </a>
        </Button>
      </div>
    </div>
  );
}