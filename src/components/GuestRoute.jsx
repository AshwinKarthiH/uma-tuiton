import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth';

export default function GuestRoute({ children }) {
  const session = getSession();
  if (session?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (session?.role === 'user') return <Navigate to="/dashboard" replace />;
  return children;
}
