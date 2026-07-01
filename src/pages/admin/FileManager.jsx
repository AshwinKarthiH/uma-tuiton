import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function FileManager() {
  const [store, setStore] = useState(null);
  
  // Upload form state
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [error, setError] = useState('');
  
  const [uploadBoard, setUploadBoard] = useState('cbse');
  const [uploadGrade, setUploadGrade] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadChapter, setUploadChapter] = useState('');
  const [uploadType, setUploadType] = useState('notes');
  const [customName, setCustomName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Table state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const boardsRes = await api.get('/boards/');
      const boardTree = {};
      
      // Fetch full tree for each board
      await Promise.all(boardsRes.data.map(async (b) => {
        const boardId = b.id || b._id;
        const gradesRes = await api.get(`/boards/${boardId}/grades/`);
        
        // Reconstruct grades dictionary expected by UI
        const gradesDict = {};
        gradesRes.data.forEach(g => {
          gradesDict[g.id] = g;
        });
        
        boardTree[boardId] = {
          ...b,
          id: boardId,
          grades: gradesDict
        };
      }));

      const filesRes = await api.get('/files/');
      setStore({
        boards: boardTree,
        files: filesRes.data.reduce((acc, file) => {
          acc[file.id] = file;
          return acc;
        }, {})
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!store) return <div>Loading...</div>;

  // Cascading dropdown helpers
  const boardData = store.boards?.[uploadBoard] || {};
  const grades = Object.values(boardData.grades || {}).sort((a,b) => a.order - b.order);
  const subjects = uploadGrade ? Object.values(boardData.grades[uploadGrade]?.subjects || {}).sort((a,b) => a.order - b.order) : [];
  const chapters = uploadSubject ? Object.values(boardData.grades[uploadGrade]?.subjects[uploadSubject]?.chapters || {}).sort((a,b) => a.order - b.order) : [];
  const chapterData = uploadChapter ? boardData.grades[uploadGrade]?.subjects[uploadSubject]?.chapters[uploadChapter] : null;
  const types = chapterData ? Object.values(chapterData.types || {}) : [{ id: 'notes', name: 'Notes' }, { id: 'question-paper', name: 'Question Paper' }];

  const handleFileDrop = (e) => {
    e.preventDefault();
    setError('');
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('File too large. Max 3MB supported.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadGrade || !uploadSubject || !uploadChapter) {
      setError('Please select board, grade, subject, and chapter.');
      return;
    }
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(selectedFile);
      });
      
      const payload = {
        displayName: customName || selectedFile.name.replace('.pdf', ''),
        boardId: uploadBoard,
        gradeId: uploadGrade,
        subjectId: uploadSubject,
        chapterId: uploadChapter,
        typeId: uploadType,
        status: (schedulePublish && scheduleTime) ? 'scheduled' : 'draft',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        url: base64,
        scheduledPublishAt: (schedulePublish && scheduleTime) ? new Date(scheduleTime).toISOString() : null,
      };

      await api.post('/files/', payload);
      await fetchData();
      
      // Reset
      setShowUploader(false);
      setSelectedFile(null);
      setCustomName('');
      alert(payload.status === 'scheduled' ? 'Scheduled successfully ✅' : 'Uploaded as Draft ✅');
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFiles = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} file(s)?`)) return;
    try {
      await Promise.all(ids.map(id => api.delete(`/files/${id}/`)));
      await fetchData();
      setSelectedFiles([]);
    } catch {
      alert("Failed to delete files");
    }
  };

  const updateStatus = async (ids, status) => {
    try {
      await Promise.all(ids.map(id => api.patch(`/files/${id}/`, { status, scheduledPublishAt: null })));
      await fetchData();
      setSelectedFiles([]);
    } catch {
      alert("Failed to update status");
    }
  };

  let filesList = Object.values(store.files || {});
  if (filterBoard !== 'all') filesList = filesList.filter(f => f.boardId === filterBoard);
  if (filterStatus !== 'all') filesList = filesList.filter(f => f.status === filterStatus);
  if (search) filesList = filesList.filter(f => f.displayName.toLowerCase().includes(search.toLowerCase()) || f.fileName.toLowerCase().includes(search.toLowerCase()));

  // Sorting: newest first
  filesList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  return (
    <div>
      <h2 className="h2 mb-4">File Manager</h2>

      {/* Uploader */}
      <div className="card mb-4" style={{ backgroundColor: showUploader ? 'white' : 'var(--light-grey)' }}>
        {!showUploader ? (
          <button className="btn btn-outline w-full text-center" style={{ padding: '1rem', color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={() => setShowUploader(true)}>
            ⬆️ Click to Upload New File
          </button>
        ) : (
          <div>
            <div className="d-flex justify-between align-center mb-4">
              <h3 className="h3">Upload Document</h3>
              <button className="btn btn-ghost" onClick={() => setShowUploader(false)}>✕ Close</button>
            </div>
            
            {error && <div className="badge badge-red mb-4 w-full p-2">{error}</div>}
            
            <form onSubmit={handleUpload}>
              <div className="grid grid-cols-4 mb-3">
                <div className="form-group">
                  <label className="form-label">Board</label>
                  <select className="form-input" value={uploadBoard} onChange={e => { setUploadBoard(e.target.value); setUploadGrade(''); setUploadSubject(''); setUploadChapter(''); }}>
                    <option value="cbse">CBSE</option>
                    <option value="stateboard">State Board</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-input" value={uploadGrade} onChange={e => { setUploadGrade(e.target.value); setUploadSubject(''); setUploadChapter(''); }} required>
                    <option value="">Select Grade...</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={uploadSubject} onChange={e => { setUploadSubject(e.target.value); setUploadChapter(''); }} required disabled={!uploadGrade}>
                    <option value="">Select Subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chapter</label>
                  <select className="form-input" value={uploadChapter} onChange={e => setUploadChapter(e.target.value)} required disabled={!uploadSubject}>
                    <option value="">Select Chapter...</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 mb-4">
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select className="form-input" value={uploadType} onChange={e => setUploadType(e.target.value)}>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Name (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. Chapter 1 Notes (Detailed)" value={customName} onChange={e => setCustomName(e.target.value)} />
                </div>
              </div>

              {/* Drag Drop Zone */}
              <div 
                style={{ 
                  border: '2px dashed var(--accent-blue)', borderRadius: '0.5rem', padding: '3rem', 
                  textAlign: 'center', backgroundColor: '#f0f9ff', marginBottom: '1.5rem',
                  cursor: 'pointer'
                }}
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}>📄</div>
                {selectedFile ? (
                  <div>
                    <h4 className="mb-1" style={{ color: 'var(--primary-navy)' }}>{selectedFile.name}</h4>
                    <p className="text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="mb-1" style={{ color: 'var(--primary-navy)' }}>Click to browse or drag PDF here</h4>
                    <p className="text-muted">Maximum file size: 3MB</p>
                  </div>
                )}
                <input type="file" id="file-upload" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileDrop} />
              </div>

              <div className="d-flex justify-between align-center border-top pt-3">
                <div className="d-flex align-center gap-2">
                  <input type="checkbox" id="schedule" checked={schedulePublish} onChange={e => setSchedulePublish(e.target.checked)} />
                  <label htmlFor="schedule">Schedule automatic publish</label>
                  {schedulePublish && (
                    <input type="datetime-local" className="form-input" style={{ width: 'auto', padding: '0.2rem 0.5rem' }} value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} required />
                  )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={isUploading || !selectedFile} style={{ minWidth: '150px' }}>
                  {isUploading ? 'Processing...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bulk Actions & Filters */}
      <div className="d-flex justify-between align-center mb-3">
        <div className="d-flex gap-2">
          <input type="text" className="form-input" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '250px' }} />
          <select className="form-input" value={filterBoard} onChange={e => setFilterBoard(e.target.value)}>
            <option value="all">All Boards</option>
            <option value="cbse">CBSE</option>
            <option value="stateboard">State Board</option>
          </select>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published 🟢</option>
            <option value="draft">Draft 🟠</option>
            <option value="scheduled">Scheduled 🕐</option>
          </select>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="d-flex align-center gap-2 bg-white p-1 rounded" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <span className="text-muted ms-2" style={{ fontSize: '0.9rem' }}>{selectedFiles.length} selected</span>
            <button className="btn btn-ghost text-green" onClick={() => updateStatus(selectedFiles, 'published')}>🟢 Publish</button>
            <button className="btn btn-ghost text-yellow" onClick={() => updateStatus(selectedFiles, 'draft')}>🟠 Draft</button>
            <button className="btn btn-ghost text-red" onClick={() => deleteFiles(selectedFiles)}>🗑️ Delete</button>
          </div>
        )}
      </div>

      {/* Files Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-grey)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedFiles.length === filesList.length && filesList.length > 0}
                  onChange={(e) => setSelectedFiles(e.target.checked ? filesList.map(f => f.id) : [])}
                />
              </th>
              <th style={{ padding: '1rem' }}>Document Name</th>
              <th style={{ padding: '1rem' }}>Path</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Uploaded</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filesList.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No files found.</td></tr>
            ) : (
              filesList.map(file => {
                const bName = store.boards?.[file.boardId]?.name || file.boardId;
                const gName = store.boards?.[file.boardId]?.grades?.[file.gradeId]?.name || file.gradeId;
                const sName = store.boards?.[file.boardId]?.grades?.[file.gradeId]?.subjects?.[file.subjectId]?.name || file.subjectId;
                const cName = store.boards?.[file.boardId]?.grades?.[file.gradeId]?.subjects?.[file.subjectId]?.chapters?.[file.chapterId]?.name || file.chapterId;
                
                return (
                  <tr key={file.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: selectedFiles.includes(file.id) ? '#f0f9ff' : 'white' }}>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFiles([...selectedFiles, file.id]);
                          else setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{file.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <div className="text-muted">{bName} › {gName}</div>
                      <div>{sName} › <span title={cName} style={{ maxWidth: '150px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom' }}>{cName}</span></div>
                    </td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-gray">{file.typeId}</span></td>
                    <td style={{ padding: '1rem' }}>
                      {file.status === 'published' ? <span className="badge badge-green">🟢 Published</span> :
                       file.status === 'draft' ? <span className="badge badge-yellow">🟠 Draft</span> :
                       <span className="badge badge-blue">🕐 {new Date(file.scheduledPublishAt).toLocaleDateString()}</span>}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div className="d-flex justify-end gap-1">
                        <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => window.open(file.url, '_blank')} title="Preview in new tab">👁️</button>
                        {file.status === 'published' ? (
                          <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => updateStatus([file.id], 'draft')} title="Unpublish">📥</button>
                        ) : (
                          <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => updateStatus([file.id], 'published')} title="Publish">📤</button>
                        )}
                        <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => deleteFiles([file.id])} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
