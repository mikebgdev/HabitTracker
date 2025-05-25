import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { I18nProvider } from "@/lib/I18nProvider";
import ProtectedRoute from "@/lib/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import MyRoutines from "@/pages/MyRoutines";
import Groups from "@/pages/Groups";
import ProgressPage from "@/pages/Progress";
import Account from "@/pages/Account";
import NotFound from "@/pages/not-found";

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
