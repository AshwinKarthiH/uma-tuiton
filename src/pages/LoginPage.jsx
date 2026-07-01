import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../utils/auth';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login/', { email, password });
      saveSession(res.data.user, res.data.access, res.data.refresh);
      
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--white)' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--accent-blue) 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Shapes */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

        <div style={{ zIndex: 10 }}>
          <div className="d-flex align-center gap-1 mb-4">
            <span style={{ fontSize: '3rem' }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: '2.5rem' }}>Uma Tuition</span>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--golden-yellow)' }}>
            Empowering Minds, Shaping Futures
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '500px' }}>
            Log in to access your personalized learning dashboard and exclusive study materials.
          </p>

          <ul className="d-flex flex-column gap-3" style={{ fontSize: '1.1rem' }}>
            <li className="d-flex align-center gap-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📚</div>
              <span>Access premium Grade-wise Materials</span>
            </li>
            <li className="d-flex align-center gap-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
              <span> High-quality Notes & PDFs</span>
            </li>
            <li className="d-flex align-center gap-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
              <span>Track your learning progress</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <div className="text-center mb-4">
            <h2 className="h2 mb-1">Welcome Back</h2>
            <p className="text-muted">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--error-red)', color: 'white', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '35px', color: 'var(--text-muted)' }}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.875rem' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="card mt-4" style={{ backgroundColor: 'var(--light-grey)', border: '1px dashed var(--border-light)' }}>
            <h5 className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>Demo Credentials:</h5>
            <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
              <div className="d-flex justify-between border-bottom pb-1">
                <span className="badge badge-blue">Admin</span>
                <span>admin@umatuition.com / admin123</span>
              </div>
              <div className="d-flex justify-between">
                <span className="badge badge-green">Student</span>
                <span>student@umatuition.com / student123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
