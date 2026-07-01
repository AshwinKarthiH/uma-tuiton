import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../data';

export default function Dashboard() {
  const { stats, content, logs } = useData();

  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#4299e1' },
    { icon: '📚', label: 'Total Grades', value: stats.totalGrades, color: '#48bb78' },
    { icon: '🟠', label: 'Draft Documents', value: stats.totalDraft, color: '#ed8936' },
    { icon: '🟢', label: 'Published Documents', value: stats.totalPublished, color: '#38a169' },
    { icon: '👁️', label: 'Total Views', value: stats.totalViews, color: '#9f7aea' },
  ];

  // Board-specific stats
  const boardStats = ['cbse', 'stateboard'].map(bid => {
    const board = content?.boards?.[bid];
    if (!board) return null;
    const grades = Object.values(board.grades || {});
    let subjects = 0, chapters = 0;
    grades.forEach(g => {
      const subs = Object.values(g.subjects || {});
      subjects += subs.length;
      subs.forEach(s => { chapters += Object.keys(s.chapters || {}).length; });
    });
    return { id: bid, name: board.name, grades: grades.length, subjects, chapters };
  }).filter(Boolean);

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your academy.</p>
        </div>
        <button
          onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
          style={{
            padding: '8px 18px', borderRadius: '8px',
            border: '1px solid #1a237e', background: '#fff',
            color: '#1a237e', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px'
          }}
        >
          🌐 View Website ↗
        </button>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        {statCards.map(c => (
          <div className="stat-card" key={c.label} style={{ '--stat-color': c.color }}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{c.value}</span>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/content" className="action-btn action-btn-primary">➕ Add New Grade</Link>
          <Link to="/admin/files" className="action-btn action-btn-secondary">⬆️ Upload File</Link>
          <Link to="/admin/users" className="action-btn action-btn-secondary">➕ Add User</Link>
        </div>
      </div>

      {/* Two panels side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Recent Activity */}
        <div className="admin-card">
          <h2 className="admin-card-title">Recent Activity</h2>
          {recentLogs.length === 0 ? (
            <p style={{ color: 'var(--color-text-light)', fontSize: '.9rem' }}>No activity yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentLogs.map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 }}>{l.userName?.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.userName} viewed {l.fileName}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--color-text-light)' }}>{formatDate(l.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Overview */}
        <div className="admin-card">
          <h2 className="admin-card-title">Content Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {boardStats.map(bs => (
              <div key={bs.id} style={{ padding: '16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
                <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: '12px', color: 'var(--color-navy)' }}>{bs.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                  <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{bs.grades}</div><div style={{ fontSize: '.75rem', color: 'var(--color-text-light)' }}>Grades</div></div>
                  <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{bs.subjects}</div><div style={{ fontSize: '.75rem', color: 'var(--color-text-light)' }}>Subjects</div></div>
                  <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{bs.chapters}</div><div style={{ fontSize: '.75rem', color: 'var(--color-text-light)' }}>Chapters</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
