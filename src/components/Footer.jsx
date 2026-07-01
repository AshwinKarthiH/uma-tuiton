import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--primary-navy)', color: 'var(--white)', paddingTop: '4rem', paddingBottom: '1.5rem', marginTop: 'auto' }}>
      <div className="container grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="d-flex align-center gap-1 mb-2">
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Uma Tuition</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
            Trusted by thousands of students across Tamil Nadu for 16 years. Excellence in CBSE & State Board Education.
          </p>
        </div>

        <div>
          <h4 className="mb-2" style={{ color: 'var(--golden-yellow)' }}>Quick Links</h4>
          <ul className="d-flex flex-column gap-1">
            <li><Link to="/" style={{ color: 'var(--border-light)', fontSize: '0.9rem' }}>Home</Link></li>
            <li><Link to="/cbse" style={{ color: 'var(--border-light)', fontSize: '0.9rem' }}>CBSE Materials</Link></li>
            <li><Link to="/stateboard" style={{ color: 'var(--border-light)', fontSize: '0.9rem' }}>State Board Materials</Link></li>
            <li><Link to="/login" style={{ color: 'var(--border-light)', fontSize: '0.9rem' }}>Student Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2" style={{ color: 'var(--golden-yellow)' }}>Contact Us</h4>
          <ul className="d-flex flex-column gap-1" style={{ color: 'var(--border-light)', fontSize: '0.9rem' }}>
            <li>📍 123 Education Hub, Chennai, Tamil Nadu</li>
            <li>✉️ support@umatuition.com</li>
          </ul>
        </div>
      </div>

      <div className="container text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © 2026 Uma Tuition. All rights reserved.
      </div>
    </footer>
  );
}
