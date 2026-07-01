import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    grades: 0,
    draftDocs: 0,
    publishedDocs: 0,
    views: 0,
    boards: [],
    files: [],
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [usersRes, filesRes, boardsRes, logsRes] = await Promise.all([
          api.get('/users/'),
          api.get('/files/'),
          api.get('/boards/'),
          api.get('/logs/?page=1') // gives total views and recent logs
        ]);

        let gradesCount = 0;
        const boardsData = [];
        
        await Promise.all(boardsRes.data.map(async (b) => {
          const boardId = b.id || b._id;
          const gRes = await api.get(`/boards/${boardId}/grades/`);
          gradesCount += gRes.data.length;
          boardsData.push({ ...b, id: boardId, gradesCount: gRes.data.length });
        }));

        setStats({
          users: usersRes.data.length,
          grades: gradesCount,
          draftDocs: filesRes.data.filter(f => f.status === 'draft').length,
          publishedDocs: filesRes.data.filter(f => f.status === 'published').length,
          views: logsRes.data.total,
          boards: boardsData,
          files: filesRes.data,
          recentLogs: logsRes.data.logs.slice(0, 5)
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="h2 mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="card d-flex align-center gap-3" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '2rem' }}>👥</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.users}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Total Users</div>
          </div>
        </div>
        <div className="card d-flex align-center gap-3" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '2rem' }}>📚</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.grades}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Total Grades</div>
          </div>
        </div>
        <div className="card d-flex align-center gap-3" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem' }}>🟠</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.draftDocs}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Draft Documents</div>
          </div>
        </div>
        <div className="card d-flex align-center gap-3" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '2rem' }}>🟢</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.publishedDocs}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Published Documents</div>
          </div>
        </div>
        <div className="card d-flex align-center gap-3" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '2rem' }}>👁️</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.views}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Total Views</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 d-flex gap-3">
        <Link to="/admin/content" className="btn btn-outline" style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }}>➕ Add Grade</Link>
        <Link to="/admin/files" className="btn btn-outline" style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }}>⬆️ Upload File</Link>
        <Link to="/admin/users" className="btn btn-outline" style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }}>➕ Add User</Link>
      </div>

      <div className="grid grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="h3 mb-3 d-flex align-center justify-between">
            Recent Activity
            <Link to="/admin/logs" className="btn btn-ghost" style={{ fontSize: '0.9rem', padding: '0.2rem 0.5rem' }}>View All</Link>
          </h3>
          {stats.recentLogs.map(log => (
            <div key={log.id} className="d-flex align-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--light-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                {log.userName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{log.userName} viewed {log.docName}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{log.boardName} › {log.gradeName} › {log.subjectName}</div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {stats.recentLogs.length === 0 && (
            <div className="text-muted text-center py-4">No recent activity.</div>
          )}
        </div>

        {/* Content Overview */}
        <div className="d-flex flex-column gap-4">
          <div className="card">
            <h3 className="h3 mb-3">Content Overview</h3>
            {stats.boards.map(b => {
              const bFiles = stats.files.filter(f => f.boardId === b.id);
              return (
                <div key={b.id} className="d-flex justify-between align-center py-2 border-bottom">
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{b.gradesCount} Grades</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontWeight: 500 }}>{bFiles.length} Docs</div>
                    <div className="text-green" style={{ fontSize: '0.85rem' }}>{bFiles.filter(f => f.status === 'published').length} Published</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
