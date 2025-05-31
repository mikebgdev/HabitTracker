import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { useToast } from '@/hooks/useToast';
import { Language } from '@/lib/i18n';

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
      description:
        selectedLanguage === 'en'
          ? t('account.languageChangedEn')
          : t('account.languageChangedEs'),
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('common.success'),
        description: t('auth.signOutSuccess'),
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('auth.signOutError'),
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      if (user) await user.delete();

      toast({
        title: t('common.success'),
        description: t('account.deletedSuccess'),
      });
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('account.deletedError'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('account.title')}</h1>

        {/* Language settings */}
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

        {/* User info */}
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

        {/* Session actions */}
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
