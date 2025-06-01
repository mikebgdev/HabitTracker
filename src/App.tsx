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
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <Toaster />
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
