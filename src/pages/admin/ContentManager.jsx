import { useState, useEffect } from 'react';
import api from '../../api/axios';

const toSlug = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function ContentManager() {
  const [board, setBoard] = useState('cbse');
  
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const fetchGrades = async () => {
    try {
      const res = await api.get(`/boards/${board}/grades/`);
      setGrades(res.data.sort((a,b) => (a.order||0) - (b.order||0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (gradeId) => {
    if (!gradeId) return setSubjects([]);
    try {
      const res = await api.get(`/boards/${board}/grades/${gradeId}/subjects/`);
      setSubjects(res.data.sort((a,b) => (a.order||0) - (b.order||0)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapters = async (gradeId, subjectId) => {
    if (!gradeId || !subjectId) return setChapters([]);
    try {
      const res = await api.get(`/boards/${board}/grades/${gradeId}/subjects/${subjectId}/chapters/`);
      setChapters(res.data.sort((a,b) => (a.order||0) - (b.order||0)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGrades();
    setSelectedGrade(null);
    setSelectedSubject(null);
    setSubjects([]);
    setChapters([]);
  }, [board]);

  useEffect(() => {
    if (selectedGrade) fetchSubjects(selectedGrade);
    else setSubjects([]);
    setSelectedSubject(null);
    setChapters([]);
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedGrade && selectedSubject) fetchChapters(selectedGrade, selectedSubject);
    else setChapters([]);
  }, [selectedSubject]);

  // Handlers for Grades
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      order: parseInt(fd.get('order') || 1, 10)
    };
    if (editingGrade?.id) data.id = editingGrade.id;
    else data.id = toSlug(data.name);

    try {
      if (editingGrade?.id) {
        await api.patch(`/boards/${board}/grades/${editingGrade.id}/`, data);
      } else {
        await api.post(`/boards/${board}/grades/`, data);
      }
      await fetchGrades();
      setEditingGrade(null);
    } catch (err) {
      alert('Failed to save grade');
    }
  };

  const deleteGrade = async (id) => {
    if(!window.confirm("Delete this grade and all its subjects/chapters?")) return;
    try {
      await api.delete(`/boards/${board}/grades/${id}/`);
      if (selectedGrade === id) setSelectedGrade(null);
      await fetchGrades();
    } catch (err) {
      alert('Failed to delete grade');
    }
  };

  // Handlers for Subjects
  const handleSaveSubject = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      icon: fd.get('icon'),
      order: parseInt(fd.get('order') || 1, 10)
    };
    if (editingSubject?.id) data.id = editingSubject.id;
    else data.id = toSlug(data.name);

    try {
      if (editingSubject?.id) {
        await api.patch(`/boards/${board}/grades/${selectedGrade}/subjects/${editingSubject.id}/`, data);
      } else {
        await api.post(`/boards/${board}/grades/${selectedGrade}/subjects/`, data);
      }
      await fetchSubjects(selectedGrade);
      setEditingSubject(null);
    } catch (err) {
      alert('Failed to save subject');
    }
  };

  const deleteSubject = async (id) => {
    if(!window.confirm("Delete this subject and all its chapters?")) return;
    try {
      await api.delete(`/boards/${board}/grades/${selectedGrade}/subjects/${id}/`);
      if (selectedSubject === id) setSelectedSubject(null);
      await fetchSubjects(selectedGrade);
    } catch (err) {
      alert('Failed to delete subject');
    }
  };

  // Handlers for Chapters
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      order: parseInt(fd.get('order') || 1, 10)
    };
    if (editingChapter?.id) data.id = editingChapter.id;
    else data.id = toSlug(data.name);

    try {
      if (editingChapter?.id) {
        await api.patch(`/boards/${board}/grades/${selectedGrade}/subjects/${selectedSubject}/chapters/${editingChapter.id}/`, data);
      } else {
        await api.post(`/boards/${board}/grades/${selectedGrade}/subjects/${selectedSubject}/chapters/`, data);
      }
      await fetchChapters(selectedGrade, selectedSubject);
      setEditingChapter(null);
    } catch (err) {
      alert('Failed to save chapter');
    }
  };

  const deleteChapter = async (id) => {
    if(!window.confirm("Delete this chapter?")) return;
    try {
      await api.delete(`/boards/${board}/grades/${selectedGrade}/subjects/${selectedSubject}/chapters/${id}/`);
      await fetchChapters(selectedGrade, selectedSubject);
    } catch (err) {
      alert('Failed to delete chapter');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h2 className="h2">Content Manager</h2>
        
        {/* Board Toggle */}
        <div className="d-flex card p-1 gap-1" style={{ borderRadius: '2rem' }}>
          <button 
            className={`btn ${board === 'cbse' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem' }}
            onClick={() => { setBoard('cbse'); }}
          >CBSE</button>
          <button 
            className={`btn ${board === 'stateboard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem' }}
            onClick={() => { setBoard('stateboard'); }}
          >State Board</button>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {/* Panel 1: Grades */}
        <div className="card d-flex flex-column" style={{ minHeight: '600px' }}>
          <div className="d-flex justify-between align-center border-bottom pb-3 mb-3">
            <h3 className="h3">Grades</h3>
            <button className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={() => setEditingGrade({})}>➕ Add</button>
          </div>
          
          {editingGrade && (
            <form onSubmit={handleSaveGrade} className="mb-3 p-3 bg-light" style={{ borderRadius: '0.5rem' }}>
              <div className="form-group mb-2"><input name="name" className="form-input" placeholder="Grade Name" defaultValue={editingGrade.name} required /></div>
              <div className="form-group mb-2"><input name="order" type="number" className="form-input" placeholder="Order (e.g. 1)" defaultValue={editingGrade.order} required /></div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingGrade(null)}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {grades.length === 0 ? <div className="text-muted text-center py-4">No grades found.</div> : null}
            {grades.map(g => (
              <div 
                key={g.id} 
                className={`d-flex justify-between align-center p-2 mb-2 ${selectedGrade === g.id ? 'bg-primary text-white' : 'bg-light'}`}
                style={{ borderRadius: '0.5rem', cursor: 'pointer' }}
                onClick={() => { setSelectedGrade(g.id); }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{g.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Order: {g.order}</div>
                </div>
                <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                  <button className="btn" style={{ padding: '0.2rem', color: selectedGrade === g.id ? 'white' : 'var(--text-muted)' }} onClick={() => setEditingGrade(g)}>✏️</button>
                  <button className="btn" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => deleteGrade(g.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Subjects */}
        {selectedGrade ? (
          <div className="card d-flex flex-column" style={{ minHeight: '600px' }}>
            <div className="d-flex justify-between align-center border-bottom pb-3 mb-3">
              <h3 className="h3">Subjects</h3>
              <button className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={() => setEditingSubject({})}>➕ Add</button>
            </div>
            
            {editingSubject && (
              <form onSubmit={handleSaveSubject} className="mb-3 p-3 bg-light" style={{ borderRadius: '0.5rem' }}>
                <div className="form-group mb-2"><input name="name" className="form-input" placeholder="Subject Name" defaultValue={editingSubject.name} required /></div>
                <div className="form-group mb-2">
                  <select name="icon" className="form-input" defaultValue={editingSubject.icon || '📘'} required>
                    <option value="📐">📐 Math</option>
                    <option value="🔬">🔬 Science</option>
                    <option value="🌍">🌍 Social</option>
                    <option value="📖">📖 Languages</option>
                    <option value="📘">📘 Default</option>
                  </select>
                </div>
                <div className="form-group mb-2"><input name="order" type="number" className="form-input" placeholder="Order (e.g. 1)" defaultValue={editingSubject.order} required /></div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>Save</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditingSubject(null)}>Cancel</button>
                </div>
              </form>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {subjects.length === 0 ? <div className="text-muted text-center py-4">No subjects found.</div> : null}
              {subjects.map(s => (
                <div 
                  key={s.id} 
                  className={`d-flex justify-between align-center p-2 mb-2 ${selectedSubject === s.id ? 'bg-primary text-white' : 'bg-light'}`}
                  style={{ borderRadius: '0.5rem', cursor: 'pointer' }}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  <div className="d-flex align-center gap-2">
                    <span>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Order: {s.order}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
                    <button className="btn" style={{ padding: '0.2rem', color: selectedSubject === s.id ? 'white' : 'var(--text-muted)' }} onClick={() => setEditingSubject(s)}>✏️</button>
                    <button className="btn" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => deleteSubject(s.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card d-flex align-center justify-center text-muted text-center" style={{ minHeight: '600px' }}>
            Select a grade to view subjects
          </div>
        )}

        {/* Panel 3: Chapters */}
        {selectedSubject ? (
          <div className="card d-flex flex-column" style={{ minHeight: '600px' }}>
            <div className="d-flex justify-between align-center border-bottom pb-3 mb-3">
              <h3 className="h3">Chapters</h3>
              <button className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={() => setEditingChapter({})}>➕ Add</button>
            </div>
            
            {editingChapter && (
              <form onSubmit={handleSaveChapter} className="mb-3 p-3 bg-light" style={{ borderRadius: '0.5rem' }}>
                <div className="form-group mb-2"><input name="name" className="form-input" placeholder="Chapter Name (e.g. Chapter 1 - Real Numbers)" defaultValue={editingChapter.name} required /></div>
                <div className="form-group mb-2"><input name="order" type="number" className="form-input" placeholder="Order (e.g. 1)" defaultValue={editingChapter.order} required /></div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>Save</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditingChapter(null)}>Cancel</button>
                </div>
              </form>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chapters.length === 0 ? <div className="text-muted text-center py-4">No chapters found.</div> : null}
              {chapters.map(c => (
                <div key={c.id} className="bg-light p-3 mb-2" style={{ borderRadius: '0.5rem' }}>
                  <div className="d-flex justify-between align-center mb-2">
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Order: {c.order}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn" style={{ padding: '0.2rem' }} onClick={() => setEditingChapter(c)}>✏️</button>
                      <button className="btn" style={{ padding: '0.2rem', color: '#ef4444' }} onClick={() => deleteChapter(c.id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mt-2 border-top pt-2">
                    {Object.values(c.types || {}).map(t => (
                      <span key={t.id} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{t.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card d-flex align-center justify-center text-muted text-center" style={{ minHeight: '600px' }}>
            Select a subject to view chapters
          </div>
        )}
      </div>
    </div>
  );
}
