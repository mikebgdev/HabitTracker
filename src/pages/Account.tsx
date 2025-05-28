import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n, Language } from '@/contexts/i18n';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Globe, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function Account() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const handleLanguageSelect = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
  };

  const handleSaveLanguage = () => {
    setLanguage(selectedLanguage);
    toast({
      title: t('common.success'),
      description: `Language changed to ${selectedLanguage === 'en' ? 'English' : 'Español'}`,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('common.success'),
        description: 'Successfully signed out',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to sign out',
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {

      if (user) {
        await user.delete();
      }

      toast({
        title: t('common.success'),
        description: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to delete account',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('account.title')}</h1>
        </div>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.displayName || 'Not provided'}
              </p>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('account.language')}
            </CardTitle>
            <CardDescription>
              {t('account.selectLanguage')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedLanguage} onValueChange={handleLanguageSelect}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('account.english')}</SelectItem>
                  <SelectItem value="es">{t('account.spanish')}</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSaveLanguage}
                disabled={selectedLanguage === language}
                size="sm"
              >
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.signOut')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t('account.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('account.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('account.deleteWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? t('common.loading') : t('account.confirmDeleteButton')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}