import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSession } from '../utils/auth';
import api from '../api/axios';

export default function GradePage({ board }) {
  const { gradeId } = useParams();
  const session = getSession();
  
  const [boardData, setBoardData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        const [boardsRes, gradeRes, subjectsRes] = await Promise.all([
          api.get('/boards/'),
          api.get(`/boards/${board}/grades/${gradeId}/`),
          api.get(`/boards/${board}/grades/${gradeId}/subjects/`)
        ]);
        
        const currentBoard = boardsRes.data.find(b => (b.id || b._id) === board);
        setBoardData(currentBoard);
        setGradeData(gradeRes.data);
        setSubjects(subjectsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGradeData();
  }, [board, gradeId]);

  if (loading) return <div className="p-4 text-center">Loading grade...</div>;

  const hasAccess = () => {
    if (!session) return false;
    if (session.role === 'admin') return true;
    if (session.assignedBoard !== board) return false;
    if (session.assignedGrades?.includes('all')) return true;
    return session.assignedGrades?.includes(gradeId);
  };

  if (!boardData || !gradeData) {
    return (
      <div className="container py-8 d-flex justify-center">
        <div className="card text-center" style={{ maxWidth: '420px', padding: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2 className="h2 mb-2">Grade Not Found</h2>
          <p className="text-muted mb-4">This grade doesn't exist or has been removed from {boardData?.name || 'this board'}.</p>
          <Link to={`/${board || 'cbse'}`} className="btn btn-primary w-full">← Back to {boardData?.name || 'Board'}</Link>
        </div>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="container py-8 d-flex justify-center">
        <div className="card text-center" style={{ maxWidth: '420px', padding: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
          <h3 className="h3 mb-2">Access Restricted</h3>
          <p className="text-muted mb-4">You do not have permission to view materials for this grade. Contact your administrator if you believe this is an error.</p>
          <Link to={`/${session?.assignedBoard || 'cbse'}`} className="btn btn-primary w-full">← Go to My Materials</Link>
        </div>
      </div>
    );
  }

  const subjectColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div>
      {/* Header */}
      <div className="header-gradient">
        <div className="container">
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
            <Link to={`/${board || 'cbse'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{boardData.name}</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'white' }}>{gradeData.name}</span>
          </div>
          <h1 className="h1" style={{ color: 'white', marginBottom: '0.5rem' }}>{gradeData.name} — Subjects</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px' }}>Select a subject to view chapters and materials</p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="container py-8">
        {subjects.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📖</div>
            <h3 className="h3 mb-2">No Subjects Yet</h3>
            <p className="text-muted mb-0">No subjects have been added for this grade yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {subjects.map((subject, index) => {
              const chapterCount = Object.keys(subject.chapters || {}).length;
              const color = subjectColors[index % subjectColors.length];
              return (
                <Link to={`/${board || 'cbse'}/${gradeId || 'all'}/${subject.id}`} key={subject.id} className="card card-hover text-center" style={{ textDecoration: 'none' }}>
                  <div style={{
                    fontSize: '3rem', marginBottom: '1rem',
                    background: `linear-gradient(135deg, ${color}15, ${color}30)`,
                    width: '80px', height: '80px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', border: `2px solid ${color}25`
                  }}>
                    {subject.icon || '📘'}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{subject.name}</h3>
                  <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'} Available
                  </p>
                  <div className="btn btn-primary w-full">View Chapters →</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
