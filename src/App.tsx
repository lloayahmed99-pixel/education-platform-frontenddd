import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import ModeratorLayout from './layouts/ModeratorLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import CoursesPage from './pages/student/CoursesPage';
import CourseDetailPage from './pages/student/CourseDetailPage';
import VideoPlayerPage from './pages/student/VideoPlayerPage';
import QuizPage from './pages/student/QuizPage';
import SavedVideosPage from './pages/student/SavedVideosPage';
import ForumPage from './pages/student/ForumPage';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import StudentProfilePage from './pages/admin/StudentProfilePage';
import ModeratorsPage from './pages/admin/ModeratorsPage';
import AdminCoursesPage from './pages/admin/CoursesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Moderator Pages
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Route guard component
const RequireAuth = ({ children, role }: { children: React.ReactNode; role?: string | string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user?.role || '')) {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated, user } = useAuthStore();

  const roleDashboard = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'moderator') return '/moderator/dashboard';
    return '/student/dashboard';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={isAuthenticated ? <Navigate to={roleDashboard()} replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={roleDashboard()} replace /> : <RegisterPage />} />
          <Route path="/" element={<Navigate to={roleDashboard()} replace />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <RequireAuth role="student">
                <StudentLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="video/:id" element={<VideoPlayerPage />} />
            <Route path="quiz/:id" element={<QuizPage />} />
            <Route path="saved" element={<SavedVideosPage />} />
            <Route path="forum" element={<ForumPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="moderators" element={<ModeratorsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="statistics"
              element={
                <div className="text-center py-20 text-muted">
                  <p className="text-lg">صفحة الإحصائيات — قيد التطوير</p>
                </div>
              }
            />
            <Route
              path="notifications"
              element={
                <div className="text-center py-20 text-muted">
                  <p className="text-lg">صفحة الإشعارات — قيد التطوير</p>
                </div>
              }
            />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Moderator Routes */}
          <Route
            path="/moderator"
            element={
              <RequireAuth role="moderator">
                <ModeratorLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<ModeratorDashboard />} />
            <Route
              path="students"
              element={
                <div className="text-center py-20 text-muted">
                  <p>صفحة الطلاب للمشرف — قيد التطوير</p>
                </div>
              }
            />
            <Route
              path="forum"
              element={<ForumPage />}
            />
            <Route
              path="courses"
              element={
                <div className="text-center py-20 text-muted">
                  <p>صفحة الكورسات للمشرف — قيد التطوير</p>
                </div>
              }
            />
            <Route
              path="reports"
              element={
                <div className="text-center py-20 text-muted">
                  <p>صفحة البلاغات — قيد التطوير</p>
                </div>
              }
            />
            <Route
              path="notifications"
              element={
                <div className="text-center py-20 text-muted">
                  <p>صفحة الإشعارات — قيد التطوير</p>
                </div>
              }
            />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to={roleDashboard()} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
