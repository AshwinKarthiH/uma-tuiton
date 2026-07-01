import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth';

export default function AdminRoute({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
