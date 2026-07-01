import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import api from '../api/axios';

export default function BoardPage({ board }) {
  const session = getSession();
  const navigate = useNavigate();
  
  const [boardData, setBoardData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const [boardsRes, gradesRes] = await Promise.all([
          api.get('/boards/'),
          api.get(`/boards/${board}/grades/`)
        ]);
        
        const currentBoard = boardsRes.data.find(b => (b.id || b._id) === board);
        setBoardData(currentBoard);
        setGrades(gradesRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardData();
  }, [board]);

  if (loading) return <div className="p-4 text-center">Loading board...</div>;

  if (!boardData) {
    return (
      <div className="container py-8 d-flex justify-center">
        <div className="card text-center" style={{ maxWidth: '420px', padding: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2 className="h2 mb-2">Board Not Found</h2>
          <p className="text-muted mb-4">The board you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard" className="btn btn-primary w-full">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  let visibleGrades = grades;
  if (session?.role === 'user' && !session.assignedGrades?.includes('all')) {
    visibleGrades = grades.filter(g => session.assignedGrades?.includes(g.id));
  }

  const gradeColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <div>
      {/* Header */}
      <div className="header-gradient">
        <div className="container">
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
            <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'white' }}>{boardData.name}</span>
          </div>
          <h1 className="h1" style={{ color: 'white', marginBottom: '0.5rem' }}>{boardData.name} Materials</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '600px', fontSize: '1.05rem' }}>
            Select your grade below to explore expertly curated study materials, notes, and question papers.
          </p>
        </div>
      </div>

      {/* Grades Grid */}
      <div className="container py-8">
        {visibleGrades.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📚</div>
            <h3 className="h3 mb-2">No Grades Available</h3>
            <p className="text-muted mb-0">No grades are assigned to your account or available for this board. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {visibleGrades.map((grade, index) => {
              const subjectCount = Object.keys(grade.subjects || {}).length;
              const color = gradeColors[index % gradeColors.length];
              return (
                <Link to={`/${board}/${grade.id}`} key={grade.id} className="card card-hover" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', marginBottom: '1rem', border: `2px solid ${color}33`
                  }}>🎓</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{grade.name}</h3>
                  <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'} Available
                  </p>
                  <div className="btn btn-primary w-full">View Materials →</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
