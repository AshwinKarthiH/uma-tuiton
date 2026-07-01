import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../../utils/auth';

export default function AdminLayout() {
  const [session, setSession] = useState(getSession());
  const navigate = useNavigate();

  useEffect(() => {
    const updateSession = () => setSession(getSession());
    window.addEventListener('session-updated', updateSession);
    return () => window.removeEventListener('session-updated', updateSession);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin/content', icon: '📚', label: 'Content Manager' },
    { path: '/admin/files', icon: '📁', label: 'File Manager' },
    { path: '/admin/logs', icon: '📊', label: 'Activity Logs' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/announcements', icon: '📢', label: 'Announcements' },
    { path: '/admin/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar d-flex flex-column">
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex align-center gap-1 mb-1">
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Uma Tuition</span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, paddingLeft: '2rem' }}>Admin Panel</div>
        </div>

        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `d-flex align-center gap-2 ${isActive ? 'bg-white text-primary' : 'text-white'}`}
              style={({ isActive }) => ({
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex align-center gap-2 mb-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {session?.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session?.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main d-flex flex-column" style={{ position: 'relative' }}>

        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        
        {/* Floating View Website Button */}
        <button 
          onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'var(--primary-navy)',
            color: 'white',
            border: 'none',
            borderRadius: '2rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            fontWeight: 600,
            zIndex: 1000,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>🌐</span> View Website ↗
        </button>
      </main>
    </div>
  );
}
