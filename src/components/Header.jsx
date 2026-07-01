import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/auth';

export default function Header() {
  const [session, setSession] = useState(getSession());
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateSession = () => setSession(getSession());
    window.addEventListener('session-updated', updateSession);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('session-updated', updateSession);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    position: 'relative',
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 0',
  });

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(15,27,76,0.95)' : 'rgba(15,27,76,0.5)',
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container d-flex align-center justify-between" style={{ height: '70px' }}>
        <Link to="/" className="d-flex align-center gap-1" style={{ color: 'white', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Uma Tuition <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>Est. 2008</span></span>
        </Link>
        
        <nav className="d-flex align-center gap-4 nav-links">
          {!session && (
            <>
              <NavLink to="/" end className="nav-item">Home</NavLink>
              <NavLink to="/cbse" className="nav-item">CBSE</NavLink>
              <NavLink to="/stateboard" className="nav-item">State Board</NavLink>
              <span style={{ color: 'var(--golden-yellow)', fontWeight: 600 }}>📞 1800-XXX-XXXX</span>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--golden-yellow)', color: '#0f1b4c', fontWeight: 600, border: 'none' }}>Login</Link>
            </>
          )}

          {session?.role === 'user' && (
            <>
              <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>
              <NavLink to={`/${session.assignedBoard}`} className="nav-item">
                {session.assignedBoard === 'cbse' ? 'CBSE' : 'State Board'}
              </NavLink>
              <span style={{ color: 'var(--golden-yellow)', fontWeight: 600 }}>📞 1800-XXX-XXXX</span>
              
              <div className="profile-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <button className="d-flex align-center gap-1 nav-item" style={{ background: 'none', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                  👤 {session.name.split(' ')[0]} ▾
                </button>
                <div className="dropdown-menu card" style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  width: '240px', display: 'none', flexDirection: 'column', gap: '0.5rem',
                  background: 'white', color: 'var(--text-dark)', padding: '1rem',
                  borderRadius: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  animation: 'fadeInUp 0.2s ease forwards'
                }}>
                  <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{session.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session.email}</div>
                    <div className="badge badge-blue mt-1" style={{ textTransform: 'uppercase' }}>{session.assignedBoard}</div>
                  </div>
                  <Link to="/dashboard" style={{ color: 'var(--text-dark)' }}>My Dashboard</Link>
                  <Link to={`/${session.assignedBoard}`} style={{ color: 'var(--text-dark)' }}>My Materials</Link>
                  <button onClick={handleLogout} style={{ color: 'var(--error-red)', textAlign: 'left', marginTop: '0.5rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 500 }}>Logout</button>
                </div>
              </div>
            </>
          )}

          {session?.role === 'admin' && (
            <>
              <NavLink to="/cbse" className="nav-item">CBSE</NavLink>
              <NavLink to="/stateboard" className="nav-item">State Board</NavLink>
              <span style={{ color: 'var(--golden-yellow)', fontWeight: 600 }}>📞 1800-XXX-XXXX</span>
              <div className="profile-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <button className="d-flex align-center gap-1 nav-item" style={{ background: 'none', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                  👤 Administrator ▾
                </button>
                <div className="dropdown-menu card" style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  width: '200px', display: 'none', flexDirection: 'column', gap: '0.5rem',
                  background: 'white', color: 'var(--text-dark)', padding: '1rem',
                  borderRadius: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  animation: 'fadeInUp 0.2s ease forwards'
                }}>
                  <Link to="/dashboard" style={{ color: 'var(--text-dark)' }}>Student Dashboard</Link>
                  <Link to="/admin/dashboard" style={{ color: 'var(--text-dark)' }}>Admin Panel</Link>
                  <button onClick={handleLogout} style={{ color: 'var(--error-red)', textAlign: 'left', marginTop: '0.5rem', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 500 }}>Logout</button>
                </div>
              </div>
            </>
          )}
        </nav>
        
        <style>{`
          .nav-item {
            color: white;
            text-decoration: none;
            position: relative;
            padding: 0.5rem 0;
            font-weight: 500;
          }
          .nav-item::after {
            content: '';
            position: absolute;
            width: 100%;
            transform: scaleX(0);
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: var(--golden-yellow);
            transform-origin: bottom right;
            transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
          }
          .nav-item:hover::after, .nav-item.active::after {
            transform: scaleX(1);
            transform-origin: bottom left;
          }
          .profile-dropdown:hover .dropdown-menu {
            display: flex !important;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </header>
  );
}
