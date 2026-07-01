import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { fileKey, BOARD_META } from '../data';
import PDFViewerModal from '../components/PDFViewerModal';


function ViewButton({ file, typeName, onView }) {
  return (
    <div>
      <button className="view-btn" onClick={onView}>
        View {typeName} ↗
      </button>
    </div>
  );
}

export default function ChapterMaterialsPage() {
  const { board, gradeId, subjectId, chapterId } = useParams();
  const { findBoard, findGrade, findSubject, findChapter, getOrdered, getPublishedFile, addLog } = useData();
  const { user, isAdmin } = useAuth();

  const [previewData, setPreviewData] = useState(null); // { file, typeObj }

  const boardData = findBoard(board);
  const grade = findGrade(board, gradeId);
  const subject = findSubject(board, gradeId, subjectId);
  const chapter = findChapter(board, gradeId, subjectId, chapterId);
  const meta = BOARD_META[board] || {};

  if (!boardData || !grade || !subject || !chapter) {
    return (
      <div className="page-wrapper">
        <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
          <div className="page-banner-inner"><h1>Not Found</h1></div>
        </div>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <Link to={`/${board}/${gradeId}/${subjectId}`} className="board-btn">← Back</Link>
        </div>
      </div>
    );
  }

  const types = getOrdered(chapter.types);
  const pathText = `${boardData.name} › ${grade.name} › ${subject.name} › ${chapter.name}`;

  const handleView = (file, typeObj) => {
    setPreviewData({ file, typeObj });

    // Log activity
    if (!isAdmin) {
      addLog({
        userId: user.id, userName: user.name, userEmail: user.email,
        fileName: file.displayName, fileId: file.id, boardName: boardData.name,
        gradeName: grade.name, subjectName: subject.name,
        chapterName: chapter.name, typeName: typeObj.name,
      });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-banner" style={{ background: meta.gradient || 'var(--color-bg-hero)' }}>
        <div className="page-banner-inner">
          <div className="breadcrumbs-banner">
            <Link to="/">Home</Link> <span>/</span>
            <Link to={`/${board}`}>{boardData.name}</Link> <span>/</span>
            <Link to={`/${board}/${gradeId}`}>{grade.name}</Link> <span>/</span>
            <Link to={`/${board}/${gradeId}/${subjectId}`}>{subject.name}</Link> <span>/</span>
            <span>{chapter.name}</span>
          </div>
          <h1>{chapter.name}</h1>
          <p>{boardData.name} — {grade.name} — {subject.name}</p>
        </div>
      </div>
      <div className="page-container">
        <div className="chapter-materials-layout">
          {types.map(t => {
            const fKey = fileKey(board, gradeId, subjectId, chapterId, t.id);
            const file = getPublishedFile(fKey);
            return (
              <div key={t.id} className="material-column">
                <div className="material-column-header"><span>{t.icon}</span> {t.name}</div>
                {file ? (
                  <div className="material-card">
                    <div className="material-card-icon">📎</div>
                    <h4>{file.displayName}</h4>
                    <p>Published document ready for viewing</p>
                    <ViewButton file={file} typeName={t.name} onView={() => handleView(file, t)} />
                  </div>
                ) : (
                  <div className="material-card placeholder">
                    <div className="material-card-icon" style={{ opacity: 0.4 }}>📄</div>
                    <h4>No document available yet</h4>
                    <p>Check back later for updates</p>
                    <button className="view-btn" disabled>Unavailable</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PDFViewerModal
        isOpen={!!previewData}
        onClose={() => setPreviewData(null)}
        pdfUrl={previewData?.file?.url}
        documentTitle={previewData?.file?.displayName}
        breadcrumb={`${pathText} › ${previewData?.typeObj?.name}`}
      />
    </div>
  );
}
