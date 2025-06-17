import { useState } from 'react';
import { reauthenticateWithGoogle, useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nProvider';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Globe, LogOut, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Language } from '@/lib/i18n';
import { deleteUserData } from '@/lib/firebase';

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
    let messageKey = 'account.languageChangedEn';
    if (selectedLanguage === 'es') {
      messageKey = 'account.languageChangedEs';
    } else if (selectedLanguage === 'fr') {
      messageKey = 'account.languageChangedFr';
    }
    toast({
      title: t('common.success'),
      description: t(messageKey),
      variant: 'success',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('common.success'),
        description: t('auth.signOutSuccess'),
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('auth.signOutError'),
        variant: 'error',
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (!user) throw new Error('No user');

      await reauthenticateWithGoogle(user); // Paso 1
      await deleteUserData(user.uid); // Paso 2
      await user.delete(); // Paso 3

      toast({
        title: t('common.success'),
        description: t('account.deletedSuccess'),
        variant: 'success',
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: t('common.error'),
        description: err.message || t('account.deletedError'),
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('account.title')}</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('account.language')}
            </CardTitle>
            <CardDescription>{t('account.selectLanguage')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageSelect}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('account.english')}</SelectItem>
                  <SelectItem value="es">{t('account.spanish')}</SelectItem>
                  <SelectItem value="fr">{t('account.french')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSaveLanguage}
                disabled={selectedLanguage === language}
                size="sm"
              >
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('account.userInfo')}</CardTitle>
            <CardDescription>
              {t('account.userInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('account.email')}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('account.name')}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.displayName || t('account.notProvided')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('account.actions')}</CardTitle>
            <CardDescription>{t('account.actionsDescription')}</CardDescription>
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
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('account.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('account.confirmDelete')}
                  </AlertDialogTitle>
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
                    {isDeleting
                      ? t('common.loading')
                      : t('account.confirmDeleteButton')}
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
