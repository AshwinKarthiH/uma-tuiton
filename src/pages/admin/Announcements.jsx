import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAnn, setEditingAnn] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading announcements...</div>;

  const handleOpenDrawer = (ann = null) => {
    if (ann) {
      setEditingAnn({ ...ann });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      setEditingAnn({
        title: '', message: '', type: 'info',
        expiry: tomorrow.toISOString().slice(0,16),
        dismissible: true, active: true
      });
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setEditingAnn(null), 300);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = !editingAnn.id;
    try {
      if (isNew) {
        await api.post('/announcements/', editingAnn);
      } else {
        await api.patch(`/announcements/${editingAnn.id}/`, editingAnn);
      }
      await fetchAnnouncements();
      handleCloseDrawer();
    } catch (err) {
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}/`);
      await fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const toggleStatus = async (id) => {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      try {
        await api.patch(`/announcements/${id}/`, { active: !ann.active });
        await fetchAnnouncements();
      } catch (err) {
        alert('Failed to update status');
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="d-flex justify-between align-center mb-4">
        <h2 className="h2">Announcements Manager</h2>
        <button className="btn btn-primary" onClick={() => handleOpenDrawer(null)}>➕ Add Announcement</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-grey)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem' }}>Title & Message</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Expiry</th>
              <th style={{ padding: '1rem' }}>Dismissible</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-4 text-muted">No announcements found.</td></tr>
            ) : (
              announcements.map(a => {
                const isExpired = a.expiry && new Date(a.expiry) < new Date();
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)', opacity: a.active && !isExpired ? 1 : 0.6 }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.message}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${a.type === 'info' ? 'badge-blue' : a.type === 'warning' ? 'badge-yellow' : 'badge-red'}`}>
                        {a.type === 'info' ? 'ℹ️ Info' : a.type === 'warning' ? '⚠️ Warning' : '🚨 Urgent'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {a.expiry ? new Date(a.expiry).toLocaleString() : 'Never'}
                      {isExpired && <div className="text-red" style={{ fontWeight: 'bold' }}>(Expired)</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>{a.dismissible ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => toggleStatus(a.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <span className={`badge ${a.active ? 'badge-green' : 'badge-gray'}`}>
                          {a.active ? '✅ Active' : '⛔ Inactive'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleOpenDrawer(a)}>✏️</button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(a.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: drawerOpen ? 0 : '-400px', bottom: 0, width: '400px',
        backgroundColor: 'white', zIndex: 1001, boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease', display: 'flex', flexDirection: 'column'
      }}>
        <div className="d-flex justify-between align-center p-3 border-bottom bg-light">
          <h3 className="h3 m-0">{editingAnn?.id ? 'Edit Announcement' : 'Add Announcement'}</h3>
          <button className="btn btn-ghost" onClick={handleCloseDrawer}>✕</button>
        </div>
        
        {editingAnn && (
          <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="p-4" style={{ flex: 1 }}>
              <div className="form-group mb-3">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: e.target.value})} required />
              </div>
              
              <div className="form-group mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows="3" value={editingAnn.message} onChange={e => setEditingAnn({...editingAnn, message: e.target.value})} required></textarea>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Type</label>
                <div className="d-flex gap-2">
                  <button type="button" className={`btn ${editingAnn.type === 'info' ? 'btn-primary' : 'btn-outline text-dark'}`} style={{ flex: 1, borderColor: 'var(--border-light)' }} onClick={() => setEditingAnn({...editingAnn, type: 'info'})}>ℹ️ Info</button>
                  <button type="button" className={`btn ${editingAnn.type === 'warning' ? 'btn-primary' : 'btn-outline text-dark'}`} style={{ flex: 1, borderColor: 'var(--border-light)' }} onClick={() => setEditingAnn({...editingAnn, type: 'warning'})}>⚠️ Warning</button>
                  <button type="button" className={`btn ${editingAnn.type === 'urgent' ? 'btn-primary' : 'btn-outline text-dark'}`} style={{ flex: 1, borderColor: 'var(--border-light)' }} onClick={() => setEditingAnn({...editingAnn, type: 'urgent'})}>🚨 Urgent</button>
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Expiry Date & Time</label>
                <input type="datetime-local" className="form-input" value={editingAnn.expiry} onChange={e => setEditingAnn({...editingAnn, expiry: e.target.value})} required />
              </div>

              <div className="d-flex justify-between align-center mb-3">
                <label className="form-label mb-0">Allow user to dismiss (×)</label>
                <input type="checkbox" checked={editingAnn.dismissible} onChange={e => setEditingAnn({...editingAnn, dismissible: e.target.checked})} style={{ width: '20px', height: '20px' }} />
              </div>

              <div className="d-flex justify-between align-center">
                <label className="form-label mb-0">Active</label>
                <input type="checkbox" checked={editingAnn.active} onChange={e => setEditingAnn({...editingAnn, active: e.target.checked})} style={{ width: '20px', height: '20px' }} />
              </div>
            </div>
            
            <div className="p-3 border-top d-flex gap-2 bg-light sticky-bottom">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              <button type="button" className="btn btn-ghost" onClick={handleCloseDrawer}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
