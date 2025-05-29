import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const { t } = useI18n();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('auth.welcome')}</CardTitle>
          <CardDescription>
            {t('auth.login')} to continue to your routine tracker
          </CardDescription>
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