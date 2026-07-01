import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSession } from '../utils/auth';
import api from '../api/axios';
import PDFViewerModal from '../components/PDFViewerModal';

export default function ChapterPage({ board }) {
  const { gradeId, subjectId, chapterId } = useParams();
  const session = getSession();

  const [modal, setModal] = useState({ open: false, url: '', title: '', breadcrumb: '' });
  
  const [boardData, setBoardData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  
  const [filesByType, setFilesByType] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        const [boardsRes, gradeRes, subjectRes, chapterRes, filesRes] = await Promise.all([
          api.get('/boards/'),
          api.get(`/boards/${board}/grades/${gradeId}/`),
          api.get(`/boards/${board}/grades/${gradeId}/subjects/${subjectId}/`),
          api.get(`/boards/${board}/grades/${gradeId}/subjects/${subjectId}/chapters/${chapterId}/`),
          api.get('/files/chapter/', {
            params: { board, grade: gradeId, subject: subjectId, chapter: chapterId }
          })
        ]);
        
        const currentBoard = boardsRes.data.find(b => (b.id || b._id) === board);
        setBoardData(currentBoard);
        setGradeData(gradeRes.data);
        setSubjectData(subjectRes.data);
        setChapterData(chapterRes.data);
        setFilesByType(filesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapterData();
  }, [board, gradeId, subjectId, chapterId]);

  const hasAccess = () => {
    if (!session) return false;
    if (session.role === 'admin') return true;
    if (session.assignedBoard !== board) return false;
    if (session.assignedGrades?.includes('all')) return true;
    return session.assignedGrades?.includes(gradeId);
  };

  if (loading) return <div className="p-4 text-center">Loading chapter...</div>;

  if (!boardData || !gradeData || !subjectData || !chapterData) {
    return (
      <div className="container py-8 d-flex justify-center">
        <div className="card text-center" style={{ maxWidth: '420px', padding: '3rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2 className="h2 mb-2">Chapter Not Found</h2>
          <p className="text-muted mb-4">This chapter doesn't exist or has been removed.</p>
          <Link to={`/${board || 'cbse'}/${gradeId || 'all'}/${subjectId || 'all'}`} className="btn btn-primary w-full">← Back to Subject</Link>
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

  const types = Object.values(chapterData.types || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
  const breadcrumbText = `${boardData.name} › ${gradeData.name} › ${subjectData.name} › ${chapterData.name}`;

  const openPDF = async (fileSummary) => {
    try {
      // Fetch the full file including base64 URL
      const res = await api.get(`/files/${fileSummary.id || fileSummary._id}/`);
      const fullFile = res.data;
      
      setModal({ open: true, url: fullFile.url || '', title: fullFile.displayName, breadcrumb: breadcrumbText });
      
      // Log activity
      if (session?.role !== 'admin') {
        api.post('/logs/', {
          fileId: fullFile.id,
          docName: fullFile.displayName,
          boardId: boardData.id, boardName: boardData.name,
          gradeId: gradeData.id, gradeName: gradeData.name,
          subjectId: subjectData.id, subjectName: subjectData.name,
          chapterId: chapterData.id, chapterName: chapterData.name,
          typeId: fullFile.typeId
        }).catch(err => console.error('Failed to log activity', err));
      }
    } catch (err) {
      alert('Failed to load document.');
    }
  };

  // Split types into notes-like and question-paper-like for the 2-column split
  const notesTypes = types.filter(t => t.id.includes('notes') || (!t.id.includes('question') && !t.id.includes('paper')));
  const questionTypes = types.filter(t => t.id.includes('question') || t.id.includes('paper'));

  const renderTypeCard = (type, accentColor, buttonClass) => {
    const displayFile = filesByType[type.id];
    const isDraft = displayFile && displayFile.status !== 'published';

    return (
      <div key={type.id} style={{
        padding: '1rem', borderRadius: '0.5rem',
        backgroundColor: displayFile ? 'white' : '#f8fafc',
        border: `1px solid ${displayFile ? 'var(--border-light)' : '#e2e8f0'}`,
        transition: 'all 0.2s'
      }}>
        <div className="d-flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
              {displayFile ? displayFile.displayName : type.name}
            </div>
            {displayFile && (
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                {(displayFile.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(displayFile.uploadedAt).toLocaleDateString()}
                {isDraft && <span className="badge badge-yellow" style={{ marginLeft: '0.5rem' }}>Draft</span>}
              </div>
            )}
          </div>
        </div>
        {displayFile ? (
          <button className={`btn ${buttonClass} w-full`} style={{ padding: '0.5rem 1rem' }} onClick={() => openPDF(displayFile)}>
            View Document →
          </button>
        ) : (
          <div style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.375rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            📂 No document available yet
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="header-gradient">
        <div className="container">
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
            <Link to={`/${board || 'cbse'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{boardData.name}</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <Link to={`/${board || 'cbse'}/${gradeId || 'all'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{gradeData.name}</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <Link to={`/${board || 'cbse'}/${gradeId || 'all'}/${subjectId || 'all'}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{subjectData.name}</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'white' }}>{chapterData.name}</span>
          </div>
          <h1 className="h2" style={{ color: 'white' }}>{chapterData.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>Access all study materials and resources for this chapter below.</p>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="container py-8">
        {types.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
            <p className="text-muted mb-0">No material types defined for this chapter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {/* Study Notes Column */}
            <div className="card" style={{ borderTop: '4px solid var(--success-green)' }}>
              <div className="d-flex align-center gap-2 border-bottom pb-3 mb-3">
                <div style={{ fontSize: '1.5rem' }}>📝</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Study Notes</h3>
              </div>
              <div className="d-flex flex-column gap-3">
                {notesTypes.length === 0 ? (
                  <div className="text-muted text-center" style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                    No notes types available
                  </div>
                ) : (
                  notesTypes.map(type => renderTypeCard(type, 'var(--success-green)', 'btn-primary'))
                )}
              </div>
            </div>

            {/* Question Papers Column */}
            <div className="card" style={{ borderTop: '4px solid var(--accent-blue)' }}>
              <div className="d-flex align-center gap-2 border-bottom pb-3 mb-3">
                <div style={{ fontSize: '1.5rem' }}>📄</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Question Papers</h3>
              </div>
              <div className="d-flex flex-column gap-3">
                {questionTypes.length === 0 ? (
                  <div className="text-muted text-center" style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                    No question paper types available
                  </div>
                ) : (
                  questionTypes.map(type => renderTypeCard(type, 'var(--accent-blue)', 'btn-accent'))
                )}
              </div>
            </div>
          </div>
        )}
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
