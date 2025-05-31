import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nProvider';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-24 w-24 text-yellow-500" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t('notFound.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {t('notFound.description')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('notFound.backHome')}
          </Link>
        </Button>

        <Button asChild variant="primary">
          <a
            href="https://habitmaster.replit.app/help"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('notFound.help')}
          </a>
        </Button>
      </div>
    </div>
  );
}
