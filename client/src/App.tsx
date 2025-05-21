import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/lib/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyRoutines from "@/pages/MyRoutines";
import Groups from "@/pages/Groups";
import Progress from "@/pages/Progress";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
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
            <Progress />
          </ProtectedRoute>
        </Route>
        
        <Route path="/admin">
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}

export default App;
