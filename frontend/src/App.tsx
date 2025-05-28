import { Switch, Route } from "wouter";
import { Toaster } from "@/presentation/components/ui/toaster";
import { AuthProvider } from "@/infrastructure/api/AuthContext";
import { I18nProvider } from "@/infrastructure/api/I18nProvider";
import ProtectedRoute from "@/infrastructure/api/ProtectedRoute";
import Dashboard from "@/presentation/pages/Dashboard";
import Login from "@/presentation/pages/Login";
import MyRoutines from "@/presentation/pages/MyRoutines";
import Groups from "@/presentation/pages/Groups";
import ProgressPage from "@/presentation/pages/Progress";
import Account from "@/presentation/pages/Account";
import NotFound from "@/presentation/pages/not-found";

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          
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
