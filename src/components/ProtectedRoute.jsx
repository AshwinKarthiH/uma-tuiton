import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../utils/auth';

// Any logged-in user
export function ProtectedRoute({ children }) {
  const session = getSession();
  const location = useLocation();
  if (!session) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, message: 'Please log in to view study materials.' }}
        replace
      />
    );
  }
  return children;
}

// Admin only
export function AdminRoute({ children }) {
  const session = getSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (session.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Redirect logged-in users away from login page
export function GuestRoute({ children }) {
  const session = getSession();
  if (session?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (session?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
