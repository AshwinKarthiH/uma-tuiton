import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { logAPI, announcementAPI, contentAPI } from '../api/services';
import api from '../api/axios';
import PDFViewerModal from '../components/PDFViewerModal';

export default function StudentDashboard() {
  const session = getSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentDocs, setRecentDocs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [stats, setStats] = useState({ docsViewed: 0, subjectsAccessed: 0, chaptersExplored: 0, streak: 0 });
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [boardData, setBoardData] = useState(null);
  const [modal, setModal] = useState({ open: false, url: '', title: '', breadcrumb: '' });

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    if (session.role === 'admin') { navigate('/admin/dashboard'); return; }
    const stored = JSON.parse(localStorage.getItem(`dismissed_${session.id}`) || '[]');
    setDismissed(stored);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [logsRes, annRes, boardsRes] = await Promise.all([
        logAPI.getLogs({ page: 1 }),
        announcementAPI.getAnnouncements(),
        contentAPI.getBoards(),
      ]);

      const logs = logsRes.data.logs || [];
      const anns = annRes.data || [];

      // Active non-expired announcements
      const now = new Date();
      const activeAnns = anns.filter(a =>
        a.active && (!a.expiryDate && !a.expiry || new Date(a.expiryDate || a.expiry) > now)
      );
      setAnnouncements(activeAnns);

      // Deduplicated recent docs
      const seen = new Set();
      const unique = [];
      for (const log of logs) {
        const key = log.fileId || `${log.boardId}${log.gradeId}${log.subjectId}${log.chapterId}${log.typeId}`;
        if (!seen.has(key)) { seen.add(key); unique.push(log); }
        if (unique.length >= 5) break;
      }
      setRecentDocs(unique);

      // Stats
      const uniqueFiles = new Set(logs.map(l => l.fileId).filter(Boolean));
      const uniqueSubjects = new Set(logs.map(l => `${l.boardId}${l.gradeId}${l.subjectId}`));
      const uniqueChapters = new Set(logs.map(l => `${l.boardId}${l.gradeId}${l.subjectId}${l.chapterId}`));
      setStats({
        docsViewed: uniqueFiles.size || logsRes.data.total || logs.length,
        subjectsAccessed: uniqueSubjects.size,
        chaptersExplored: uniqueChapters.size,
        streak: calculateStreak(logs),
      });

      // Load full board tree for progress calculation
      const boardTree = {};
      await Promise.all(boardsRes.data.map(async (b) => {
        const boardId = b.id || b._id;
        const gradesRes = await contentAPI.getGrades(boardId);
        const gradesDict = {};
        gradesRes.data.forEach(g => { gradesDict[g.id] = g; });
        boardTree[boardId] = { ...b, id: boardId, grades: gradesDict };
      }));
      setBoardData(boardTree);

      // Calculate progress
      if (session.assignedBoard && boardTree[session.assignedBoard]) {
        calculateProgress(logs, boardTree[session.assignedBoard]);
      }

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (logs) => {
    if (!logs.length) return 0;
    const days = [...new Set(logs.map(l => l.timestamp?.slice(0, 10)).filter(Boolean))].sort().reverse();
    let streak = 0;
    let current = new Date();
    for (const day of days) {
      const diff = Math.floor((current - new Date(day)) / 86400000);
      if (diff <= 1) { streak++; current = new Date(day); }
      else break;
    }
    return Math.max(streak, 1);
  };

  const calculateProgress = (logs, board) => {
    const progress = [];
    const grades = board?.grades || {};
    for (const [gradeId, grade] of Object.entries(grades)) {
      if (session.assignedGrades?.includes('all') || session.assignedGrades?.includes(gradeId)) {
        const subjects = grade.subjects || {};
        for (const [subjectId, subject] of Object.entries(subjects)) {
          const totalChapters = Object.keys(subject.chapters || {}).length;
          if (totalChapters === 0) continue;
          const viewedChapters = new Set(
            logs.filter(l =>
              l.boardId === session.assignedBoard &&
              l.gradeId === gradeId &&
              l.subjectId === subjectId
            ).map(l => l.chapterId)
          ).size;
          progress.push({
            gradeId, gradeName: grade.name,
            subjectId, subjectName: subject.name, icon: subject.icon || '📘',
            viewed: viewedChapters, total: totalChapters,
            percent: Math.min(100, Math.round((viewedChapters / totalChapters) * 100)),
            link: `/${session.assignedBoard}/${gradeId}/${subjectId}`,
          });
        }
      }
    }
    setSubjectProgress(progress);
  };

  const dismissAnnouncement = (id) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem(`dismissed_${session.id}`, JSON.stringify(updated));
  };

  const handleViewRecent = async (doc) => {
    try {
      const res = await api.get(`/files/${doc.fileId}/`);
      const file = res.data;
      const breadcrumb = `${doc.boardName || ''} › ${doc.gradeName || ''} › ${doc.subjectName || ''} › ${doc.chapterName || ''}`;
      setModal({ open: true, url: file.url || '', title: file.displayName, breadcrumb });
    } catch {
      navigate(`/${doc.boardId}/${doc.gradeId}/${doc.subjectId}/${doc.chapterId}`);
    }
  };

  if (!session) return null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '5px solid #e4e7ed', borderTop: '5px solid #1a237e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#1a237e', fontWeight: 600 }}>Loading dashboard...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const assignedBoard = session.assignedBoard || 'cbse';
  const assignedBoardName = boardData?.[assignedBoard]?.name || assignedBoard.toUpperCase();
  const assignedGrades = session.assignedGrades || [];
  const gradeStr = assignedGrades.includes('all') ? 'All Grades' : assignedGrades.map(g => g.replace('grade-', 'Grade ')).join(', ');

  return (
    <div className="container py-4">
      {session.role === 'admin' && (
        <div className="badge badge-red mb-3 w-full justify-center p-2" style={{ fontSize: '0.9rem' }}>
          🛡️ Admin Preview Mode — You are viewing the student portal.
        </div>
      )}

      {/* Greeting */}
      <div className="card mesh-gradient mb-4" style={{ color: 'var(--white)', padding: '2rem' }}>
        <h2 className="h2 mb-1" style={{ color: 'var(--white)' }}>👋 Welcome back, {session.name.split(' ')[0]}!</h2>
        <p style={{ opacity: 0.9 }}>Here's your learning overview | Board: <strong>{assignedBoardName}</strong> | Grades: <strong>{gradeStr}</strong></p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#dc2626', marginBottom: 20 }}>
          {error} <button onClick={loadDashboard} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#1a237e', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
        </div>
      )}

      {/* Announcements */}
      {announcements.filter(a => !dismissed.includes(a.id)).length > 0 && (
        <div className="mb-4 d-flex flex-column gap-2">
          {announcements.filter(a => !dismissed.includes(a.id)).map(a => (
            <div key={a.id} style={{
              padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between',
              backgroundColor: a.type === 'info' ? '#e0f2fe' : a.type === 'warning' ? '#fef3c7' : '#fee2e2',
              border: `1px solid ${a.type === 'info' ? '#7dd3fc' : a.type === 'warning' ? '#fcd34d' : '#fca5a5'}`,
              color: a.type === 'info' ? '#0369a1' : a.type === 'warning' ? '#b45309' : '#b91c1c'
            }}>
              <div>
                <strong>{a.title}</strong>: {a.message}
              </div>
              {(a.dismissible || a.allowDismiss) && (
                <button onClick={() => dismissAnnouncement(a.id)} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 mb-4">
        {[
          { label: 'Documents Viewed', value: stats.docsViewed, icon: '📄', bg: '#e0f2fe' },
          { label: 'Subjects Accessed', value: stats.subjectsAccessed, icon: '📚', bg: '#f3e8ff' },
          { label: 'Chapters Explored', value: stats.chaptersExplored, icon: '✅', bg: '#dcfce3' },
          { label: 'Day Streak', value: stats.streak, icon: '🔥', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="card card-hover text-center">
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-navy)' }}>{s.value}</div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div>
          {/* Continue Learning */}
          <h3 className="h3 mb-3">Continue Learning</h3>
          {recentDocs.length === 0 ? (
            <div className="card text-center mb-4" style={{ padding: '3rem' }}>
              <p className="text-muted mb-3">Start exploring materials to see your recent documents here.</p>
              <Link to={`/${assignedBoard}`} className="btn btn-primary">Explore Now →</Link>
            </div>
          ) : (
            <div className="d-flex gap-3 flex-wrap mb-4" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {recentDocs.map((doc, i) => (
                <div key={i} className="card d-flex flex-column" style={{ width: '260px', padding: '1rem' }}>
                  <div className="d-flex justify-between align-center mb-2">
                    <span className="badge badge-blue">{doc.typeId}</span>
                  </div>
                  <h4 className="mb-1" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.docName}</h4>
                  <p className="text-muted mb-3" style={{ fontSize: '0.8rem', flex: 1 }}>{doc.boardName} › {doc.gradeName} › {doc.subjectName}</p>
                  <button className="btn btn-outline w-full" style={{ color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={() => handleViewRecent(doc)}>View →</button>
                </div>
              ))}
            </div>
          )}

          {/* My Subjects */}
          <h3 className="h3 mb-3">My Subjects Progress</h3>
          {subjectProgress.length === 0 ? (
            <p className="text-muted">You haven't accessed any subjects yet.</p>
          ) : (
            <div className="grid grid-cols-2 mb-4">
              {subjectProgress.map((sub, idx) => (
                <div key={idx} className="card d-flex align-center gap-3">
                  <div style={{ fontSize: '2rem', backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '0.5rem' }}>
                    {sub.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="mb-1">{sub.subjectName}</h4>
                    <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>{sub.gradeName}</div>
                    <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{
                        height: '100%',
                        width: `${sub.percent}%`,
                        backgroundColor: sub.percent === 100 ? 'var(--success-green)' : sub.percent > 50 ? 'var(--accent-blue)' : 'var(--primary-navy)',
                        transition: 'width 0.4s ease',
                      }}></div>
                    </div>
                    <div className="d-flex justify-between" style={{ fontSize: '0.8rem' }}>
                      <span>{sub.viewed}/{sub.total} Chapters</span>
                      <span style={{ fontWeight: 'bold' }}>{sub.percent}%</span>
                    </div>
                  </div>
                  <Link to={sub.link} className="btn btn-ghost" style={{ padding: '0.5rem' }}>→</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Quick Access */}
          <h3 className="h3 mb-3">Quick Access</h3>
          <div className="card card-hover card-gradient" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{assignedBoard === 'cbse' ? '📘' : '📗'}</div>
            <h4 className="mb-2">{assignedBoardName}</h4>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Browse all available grades and subjects for your assigned board.</p>
            <Link to={`/${assignedBoard}`} className="btn btn-primary w-full">📚 {assignedBoardName} Materials →</Link>
          </div>
        </div>
      </div>

      <PDFViewerModal
        isOpen={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        pdfUrl={modal.url}
        documentTitle={modal.title}
        breadcrumb={modal.breadcrumb}
      />
    </div>
  );
}
