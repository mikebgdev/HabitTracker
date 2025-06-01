import { Route, Switch } from 'wouter';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import MyRoutines from '@/pages/MyRoutines';
import Groups from '@/pages/Groups';
import ProgressPage from '@/pages/Progress';
import Account from '@/pages/Account';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import PageMetadata from '@/components/PageMetadata';

function App() {
  useEffect(() => {
    const handleErrorEvent = (event: ErrorEvent) => {
      const umami = (window as any).umami;
      if (umami) {
        umami.track('Unhandled Error', { message: event.message, stack: event.error?.stack });
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const umami = (window as any).umami;
      if (umami) {
        umami.track('Unhandled Rejection', { reason: event.reason });
      }
    };
    window.addEventListener('error', handleErrorEvent);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleErrorEvent);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <Toaster />
          <PageMetadata />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dashboard">
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/routines">
              <ProtectedRoute>
                <MyRoutines />
              </ProtectedRoute>
            </Route>
            <Route path="/groups">
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            </Route>
            <Route path="/progress">
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            </Route>
            <Route path="/account">
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
