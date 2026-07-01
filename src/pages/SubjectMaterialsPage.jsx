import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { BOARD_META } from '../data';

export default function SubjectMaterialsPage() {
  const { board, gradeId, subjectId } = useParams();
  const { findBoard, findGrade, findSubject, getOrdered } = useData();
  const navigate = useNavigate();

  const boardData = findBoard(board);
  const grade = findGrade(board, gradeId);
  const subject = findSubject(board, gradeId, subjectId);
  const meta = BOARD_META[board] || {};

  if (!boardData || !grade || !subject) {
    return (
      <div className="page-wrapper">
        <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
          <div className="page-banner-inner"><h1>Not Found</h1></div>
        </div>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <Link to={`/${board}/${gradeId}`} className="board-btn">← Back</Link>
        </div>
      </div>
    );
  }

  const chapters = getOrdered(subject.chapters);

  return (
    <div className="page-wrapper">
      <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
        <div className="page-banner-inner">
          <div className="breadcrumbs-banner">
            <Link to="/">Home</Link> <span>/</span>
            <Link to={`/${board}`}>{boardData.name}</Link> <span>/</span>
            <Link to={`/${board}/${gradeId}`}>{grade.name}</Link> <span>/</span>
            <span>{subject.name}</span>
          </div>
          <h1>{subject.icon} {subject.name}</h1>
          <p>{boardData.name} — {grade.name}</p>
        </div>
      </div>
      <div className="page-container">
        {chapters.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">📄</span><h3>No Chapters Available</h3></div>
        ) : (
          <div className="grades-grid">
            {chapters.map(ch => (
              <div key={ch.id} className="chapter-card" onClick={() => navigate(`/${board}/${gradeId}/${subjectId}/${ch.id}`)}>
                <div className="chapter-number-badge">Ch</div>
                <h3>{ch.name}</h3>
                <span className="chapter-btn">View Chapter →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
