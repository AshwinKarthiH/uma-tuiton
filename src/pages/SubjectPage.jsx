import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSession } from '../utils/auth';
import api from '../api/axios';

export default function SubjectPage({ board }) {
  const { gradeId, subjectId } = useParams();
  const session = getSession();

  const [boardData, setBoardData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const [boardsRes, gradeRes, subjectRes, chaptersRes] = await Promise.all([
          api.get('/boards/'),
          api.get(`/boards/${board}/grades/${gradeId}/`),
          api.get(`/boards/${board}/grades/${gradeId}/subjects/${subjectId}/`),
          api.get(`/boards/${board}/grades/${gradeId}/subjects/${subjectId}/chapters/`)
        ]);
        
        const currentBoard = boardsRes.data.find(b => (b.id || b._id) === board);
        setBoardData(currentBoard);
        setGradeData(gradeRes.data);
        setSubjectData(subjectRes.data);
        setChapters(chaptersRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectData();
  }, [board, gradeId, subjectId]);

  if (loading) return <div className="p-4 text-center">Loading subject...</div>;

  const hasAccess = () => {
    if (!session) return false;
    if (session.role === 'admin') return true;
    if (session.assignedBoard !== board) return false;
    if (session.assignedGrades?.includes('all')) return true;
    return session.assignedGrades?.includes(gradeId);
  };

  if (!boardData || !gradeData || !subjectData) {
    return (
      <div className="container py-8 d-flex justify-center">
        <div className="card text-center" style={{ maxWidth: '420px', padding: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2 className="h2 mb-2">Subject Not Found</h2>
          <p className="text-muted mb-4">This subject doesn't exist or has been removed.</p>
          <Link to={`/${board || 'cbse'}/${gradeId || 'all'}`} className="btn btn-primary w-full">← Back to {gradeData?.name || 'Grade'}</Link>
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
          <p className="text-muted mb-4">You do not have permission to view materials for this grade.</p>
          <Link to={`/${session?.assignedBoard || 'cbse'}`} className="btn btn-primary w-full">← Go to My Materials</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="header-gradient">
        <div className="container">
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
            <Link to={`/${board || 'cbse'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{boardData.name}</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
            <Link to={`/${board || 'cbse'}/${gradeId || 'all'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{gradeData.name}</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'white' }}>{subjectData.name}</span>
          </div>
          <div className="d-flex align-center gap-3">
            <div style={{
              fontSize: '2.5rem', background: 'rgba(255,255,255,0.15)',
              width: '64px', height: '64px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {subjectData.icon || '📘'}
            </div>
            <div>
              <h1 className="h1" style={{ color: 'white', marginBottom: '0.25rem' }}>{subjectData.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)' }}>{gradeData.name} • {boardData.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="container py-8">
        {chapters.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
            <h3 className="h3 mb-2">No Chapters Yet</h3>
            <p className="text-muted mb-0">No chapters have been added for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {chapters.map((chapter, index) => {
              const typeCount = Object.keys(chapter.types || {}).length;
              return (
                <Link to={`/${board || 'cbse'}/${gradeId || 'all'}/${subjectId || 'all'}/${chapter.id}`} key={chapter.id} className="card card-hover d-flex align-center gap-3" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1a237e, #2c5282)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>{chapter.name}</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
                      {typeCount} Material {typeCount === 1 ? 'Type' : 'Types'}
                    </p>
                  </div>
                  <div style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                    View →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
