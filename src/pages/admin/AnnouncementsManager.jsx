import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatDate } from '../../data';

export default function AnnouncementsManager() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const defaultForm = {
    title: '', message: '', type: 'info', expiryDate: '', allowDismiss: true, active: true
  };
  const [form, setForm] = useState(defaultForm);

  const openDrawer = (ann = null) => {
    if (ann) {
      setEditingId(ann.id);
      setForm({ ...ann });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    setShowDrawer(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateAnnouncement(editingId, form);
    else addAnnouncement(form);
    setShowDrawer(false);
  };

  const getStatus = (ann) => {
    if (!ann.active) return <span style={{color: '#718096'}}>Inactive</span>;
    if (ann.expiryDate && new Date(ann.expiryDate) < new Date()) return <span style={{color: '#a0aec0'}}>Expired</span>;
    return <span style={{color: '#38a169', fontWeight: 600}}>Active</span>;
  };

  const getTypeStyle = (type) => {
    if (type === 'urgent') return { background: '#fed7d7', color: '#822727' };
    if (type === 'warning') return { background: '#feebc8', color: '#7b341e' };
    return { background: '#bee3f8', color: '#2c5282' }; // info
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1>Announcements</h1><p>Manage student dashboard announcements.</p></div>
          <button className="action-btn action-btn-primary" onClick={() => openDrawer()}>+ Add Announcement</button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
            <thead><tr style={{ background: 'var(--color-bg)', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid var(--color-border)' }}>Title</th>
              <th style={{ padding: '12px', borderBottom: '2px solid var(--color-border)' }}>Type</th>
              <th style={{ padding: '12px', borderBottom: '2px solid var(--color-border)' }}>Status</th>
              <th style={{ padding: '12px', borderBottom: '2px solid var(--color-border)' }}>Expiry Date</th>
              <th style={{ padding: '12px', borderBottom: '2px solid var(--color-border)', textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {announcements.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{a.message}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '.75rem', fontWeight: 600, textTransform: 'capitalize', ...getTypeStyle(a.type) }}>
                      {a.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{getStatus(a)}</td>
                  <td style={{ padding: '12px', fontSize: '.85rem' }}>{a.expiryDate ? formatDate(a.expiryDate) : 'Never'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => openDrawer(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginRight: '8px' }}>✏️</button>
                    <button onClick={() => { if(window.confirm('Delete announcement?')) deleteAnnouncement(a.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#e53e3e' }}>🗑️</button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-light)' }}>No announcements found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showDrawer && (
        <>
          <div onClick={() => setShowDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '90vw', background: 'white', zIndex: 1001, boxShadow: '-8px 0 30px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{editingId ? 'Edit Announcement' : 'Add Announcement'}</h2>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-light)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto', flex: 1 }}>
              <div className="form-group"><label>Title</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="form-group"><label>Message</label><textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--color-border)', width: '100%', resize: 'vertical' }} /></div>
              
              <div className="form-group">
                <label>Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['info', 'warning', 'urgent'].map(type => (
                    <button key={type} type="button" onClick={() => setForm({...form, type})} 
                      style={{ flex: 1, padding: '8px', borderRadius: '50px', border: '1px solid', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize',
                        borderColor: form.type === type ? getTypeStyle(type).color : 'var(--color-border)',
                        background: form.type === type ? getTypeStyle(type).background : 'transparent',
                        color: form.type === type ? getTypeStyle(type).color : 'var(--color-text)'
                      }}>
                      {type === 'info' ? 'ℹ️' : type === 'warning' ? '⚠️' : '🚨'} {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group"><label>Expiry Date (Optional)</label><input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} /></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="allowDismiss" checked={form.allowDismiss} onChange={e => setForm({...form, allowDismiss: e.target.checked})} />
                <label htmlFor="allowDismiss" style={{ marginBottom: 0, fontWeight: 500 }}>Allow students to dismiss (✕)</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                <label htmlFor="active" style={{ marginBottom: 0, fontWeight: 500 }}>Active</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
                <button type="button" className="action-btn action-btn-secondary" onClick={() => setShowDrawer(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="action-btn action-btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
