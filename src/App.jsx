import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { getSession } from './utils/auth';

import Header from './components/Header';
import Footer from './components/Footer';

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#f8fafc', flexDirection: 'column', gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, border: '5px solid #e4e7ed',
      borderTop: '5px solid #1a237e', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ color: '#1a237e', fontWeight: 600 }}>Loading...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Lazy load all pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const BoardPage = lazy(() => import('./pages/BoardPage'));
const GradePage = lazy(() => import('./pages/GradePage'));
const SubjectPage = lazy(() => import('./pages/SubjectPage'));
const ChapterPage = lazy(() => import('./pages/ChapterPage'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const FileManager = lazy(() => import('./pages/admin/FileManager'));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

// Route guards
function ProtectedRoute({ children }) {
  const session = getSession();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" state={{ from: location, message: 'Please log in to view study materials.' }} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const session = getSession();
  if (session?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (session?.role === 'user') return <Navigate to="/dashboard" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '4rem', color: '#1a237e' }}>404</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Page not found.</p>
      <button onClick={() => window.location.href = '/'} style={{
        padding: '10px 24px', background: '#1a237e', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16,
      }}>Go Home</button>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

            {/* Student */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/cbse" element={<ProtectedRoute><BoardPage board="cbse" /></ProtectedRoute>} />
            <Route path="/stateboard" element={<ProtectedRoute><BoardPage board="stateboard" /></ProtectedRoute>} />
            <Route path="/cbse/:gradeId" element={<ProtectedRoute><GradePage board="cbse" /></ProtectedRoute>} />
            <Route path="/cbse/:gradeId/:subjectId" element={<ProtectedRoute><SubjectPage board="cbse" /></ProtectedRoute>} />
            <Route path="/cbse/:gradeId/:subjectId/:chapterId" element={<ProtectedRoute><ChapterPage board="cbse" /></ProtectedRoute>} />
            <Route path="/stateboard/:gradeId" element={<ProtectedRoute><GradePage board="stateboard" /></ProtectedRoute>} />
            <Route path="/stateboard/:gradeId/:subjectId" element={<ProtectedRoute><SubjectPage board="stateboard" /></ProtectedRoute>} />
            <Route path="/stateboard/:gradeId/:subjectId/:chapterId" element={<ProtectedRoute><ChapterPage board="stateboard" /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="files" element={<FileManager />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && !isLoginRoute && <Footer />}
    </>
  );
}
