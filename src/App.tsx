import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
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

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
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
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
