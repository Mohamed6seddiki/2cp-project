import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';

// Public & Auth Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import LessonsBrowser from './pages/student/LessonsBrowser';
import LessonDetail from './pages/student/LessonDetail';
import CodeEditorWorkspace from './pages/student/CodeEditorWorkspace';
import AIAssistant from './pages/student/AIAssistant';
import Progress from './pages/student/Progress';
import Profile from './pages/student/Profile';
import Settings from './pages/student/Settings';
import Leaderboard from './pages/student/Leaderboard';
import Downloads from './pages/student/Downloads';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageLessons from './pages/admin/ManageLessons';
import ManageUsers from './pages/admin/ManageUsers';
import AddPractice from './pages/admin/AddPractice';

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const RequireRole = ({
  children,
  roles,
}: {
  children: ReactElement;
  roles: Array<'student' | 'admin'>;
}) => {
  const { user, getHomePath } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={getHomePath()} replace />;
  }

  return children;
};

const GuestOnly = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, getHomePath } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getHomePath()} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth */}
          <Route
            path="/auth/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/auth/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <Dashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/lessons"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <LessonsBrowser />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <LessonDetail />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/practice"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <CodeEditorWorkspace />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/progress"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <Progress />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/downloads"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <Downloads />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/assistant"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <AIAssistant />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <RequireRole roles={['student', 'admin']}>
                  <Profile />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireAuth>
                <RequireRole roles={['student']}>
                  <Leaderboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <Navigate to="/admin/dashboard" replace />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/lessons"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <ManageLessons />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/practice"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <AddPractice />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <RequireRole roles={['admin']}>
                  <ManageUsers />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
              <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
              <p className="text-xl text-text-muted">Oops! We couldn't find that page.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
