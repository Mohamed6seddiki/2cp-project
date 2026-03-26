import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './hooks/useAuth';
import StudentDashboard from './pages/student/Dashboard';
import LessonsBrowser from './pages/student/LessonsBrowser';
import LessonDetail from './pages/student/LessonDetail';
import ExercisesPage from './pages/student/ExercisesPage';
import CodeEditorWorkspace from './pages/student/CodeEditorWorkspace';
import Progress from './pages/student/Progress';
import Downloads from './pages/student/Downloads';
import AIAssistant from './pages/student/AIAssistant';
import Profile from './pages/student/Profile';
import Settings from './pages/student/Settings';
import Leaderboard from './pages/student/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageLessons from './pages/admin/ManageLessons';
import AddPractice from './pages/admin/AddPractice';
import ManageUsers from './pages/admin/ManageUsers';

function GuestOnly({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

function LegacyLessonRedirect() {
  const { lessonId } = useParams();
  if (!lessonId) return <Navigate to="/lessons" replace />;
  return <Navigate to={`/lesson/${lessonId}`} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <Register />
              </GuestOnly>
            }
          />
          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/register" element={<Navigate to="/register" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <ProtectedRoute roles={['student']}>
                <LegacyLessonRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute roles={['student']}>
                <LessonsBrowser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <ProtectedRoute roles={['student']}>
                <LessonDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute roles={['student']}>
                <ExercisesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute roles={['student']}>
                <CodeEditorWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute roles={['student']}>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/downloads"
            element={
              <ProtectedRoute roles={['student']}>
                <Downloads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute roles={['student']}>
                <AIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute roles={['student']}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['student', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={['student', 'admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/lessons"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/practice"
            element={
              <ProtectedRoute roles={['admin']}>
                <AddPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
