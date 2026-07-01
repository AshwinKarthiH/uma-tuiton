import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { BOARD_META } from '../data';

export default function GradeMaterialsPage() {
  const { board, gradeId } = useParams();
  const { findBoard, findGrade, getOrdered } = useData();
  const navigate = useNavigate();

  const boardData = findBoard(board);
  const grade = findGrade(board, gradeId);
  const meta = BOARD_META[board] || {};

  if (!boardData || !grade) {
    return (
      <div className="page-wrapper">
        <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
          <div className="page-banner-inner"><h1>Grade Not Found</h1><p>The requested grade does not exist.</p></div>
        </div>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <Link to={`/${board}`} className="board-btn">← Back to {boardData?.name || 'Board'}</Link>
        </div>
      </div>
    );
  }

  const subjects = getOrdered(grade.subjects);

  return (
    <div className="page-wrapper">
      <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
        <div className="page-banner-inner">
          <div className="breadcrumbs-banner">
            <Link to="/">Home</Link> <span>/</span>
            <Link to={`/${board}`}>{boardData.name}</Link> <span>/</span>
            <span>{grade.name}</span>
          </div>
          <h1>{grade.name} Study Materials</h1>
          <p>Select a subject to view chapters</p>
        </div>
      </div>
      <div className="page-container">
        {subjects.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📚</span><h3>No Subjects Available</h3></div>
        ) : (
          <div className="grades-grid">
            {subjects.map(sub => {
              const chCount = Object.keys(sub.chapters || {}).length;
              return (
                <div key={sub.id} className="subject-card" onClick={() => navigate(`/${board}/${gradeId}/${sub.id}`)}>
                  <div className="subject-icon-generic">{sub.icon}</div>
                  <h3>{sub.name}</h3>
                  <p className="grade-meta">{chCount} Chapter{chCount !== 1 ? 's' : ''}</p>
                  <span className="grade-btn">View Materials →</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
