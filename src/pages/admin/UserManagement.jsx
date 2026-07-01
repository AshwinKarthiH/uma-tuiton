import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function UserManagement() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsersAndBoards = async () => {
    try {
      const [usersRes, boardsRes] = await Promise.all([
        api.get('/users/'),
        api.get('/boards/')
      ]);
      
      const boardTree = {};
      await Promise.all(boardsRes.data.map(async (b) => {
        const boardId = b.id || b._id;
        const gradesRes = await api.get(`/boards/${boardId}/grades/`);
        const gradesDict = {};
        gradesRes.data.forEach(g => { gradesDict[g.id] = g; });
        boardTree[boardId] = { ...b, id: boardId, grades: gradesDict };
      }));

      setStore({ users: usersRes.data, boards: boardTree });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndBoards();
  }, []);

  if (loading || !store) return <div className="p-4 text-center">Loading users...</div>;

  if (!store) return null;

  const users = store.users || [];

  const handleOpenDrawer = (user = null) => {
    if (user) {
      setEditingUser({ ...user });
    } else {
      setEditingUser({
        name: '', email: '', password: '',
        role: 'user', status: 'active',
        assignedBoard: 'cbse', assignedGrades: ['all']
      });
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setEditingUser(null), 300);
  };

  const toggleGrade = (gradeId) => {
    let current = [...(editingUser.assignedGrades || [])];
    if (gradeId === 'all') {
      current = ['all'];
    } else {
      if (current.includes('all')) current = [];
      if (current.includes(gradeId)) {
        current = current.filter(g => g !== gradeId);
      } else {
        current.push(gradeId);
      }
    }
    setEditingUser({ ...editingUser, assignedGrades: current });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const isNew = !editingUser.id;
    
    try {
      if (isNew) {
        await api.post('/users/', editingUser);
      } else {
        await api.patch(`/users/${editingUser.id}/`, editingUser);
      }
      await fetchUsersAndBoards();
      alert('✅ User saved successfully');
      handleCloseDrawer();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save user');
    }
  };

  const toggleUserStatus = async (id) => {
    const user = store.users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      try {
        await api.patch(`/users/${id}/`, { status: newStatus });
        await fetchUsersAndBoards();
      } catch (err) {
        alert('Failed to update status');
      }
    }
  };

  const getBoardGrades = (boardId) => {
    if (!store.boards?.[boardId]) return [];
    return Object.values(store.boards[boardId].grades || {}).sort((a,b) => a.order - b.order);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="d-flex justify-between align-center mb-4">
        <h2 className="h2">User Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenDrawer(null)}>➕ Add User</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-grey)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Access</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', opacity: u.status === 'active' ? 1 : 0.6 }}>
                <td style={{ padding: '1rem' }}>
                  <div className="d-flex align-center gap-2">
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0f2fe', color: u.role === 'admin' ? '#ef4444' : '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role === 'admin' ? '🛡️ Admin' : '👤 User'}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  {u.role === 'admin' ? (
                    <span className="text-muted">Full Access</span>
                  ) : (
                    <>
                      <div style={{ textTransform: 'uppercase', fontWeight: 600 }}>{u.assignedBoard}</div>
                      <div className="text-muted" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.assignedGrades?.includes('all') ? 'All Grades' : store.boards?.[u.assignedBoard] ? 
                          u.assignedGrades?.map(gid => store.boards[u.assignedBoard].grades?.[gid]?.name).filter(Boolean).join(', ') : 'None'}
                      </div>
                    </>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => toggleUserStatus(u.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {u.status === 'active' ? '✅ Active' : '⛔ Inactive'}
                    </span>
                  </button>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleOpenDrawer(u)}>✏️ Edit</button>
                </td>
              </tr>
            ))}
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
        position: 'fixed', top: 0, right: drawerOpen ? 0 : '-450px', bottom: 0, width: '400px',
        backgroundColor: 'white', zIndex: 1001, boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
        transition: 'right 0.3s ease', display: 'flex', flexDirection: 'column'
      }}>
        <div className="d-flex justify-between align-center p-3 border-bottom bg-light">
          <h3 className="h3 m-0">{editingUser?.id ? 'Edit User' : 'Add User'}</h3>
          <button className="btn btn-ghost" onClick={handleCloseDrawer}>✕</button>
        </div>
        
        {editingUser && (
          <form onSubmit={handleSaveUser} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div className="p-4" style={{ flex: 1 }}>
              <div className="mb-4 pb-3 border-bottom">
                <h4 className="mb-3 text-muted">A. Basic Info</h4>
                <div className="form-group mb-2">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
                </div>
                <div className="form-group mb-2">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Password</label>
                  <input type="text" className="form-input" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} required />
                </div>
              </div>

              <div className="mb-4 pb-3 border-bottom">
                <h4 className="mb-3 text-muted">B. Account Settings</h4>
                <div className="d-flex gap-4 mb-3">
                  <div>
                    <label className="form-label mb-2 d-block">Role</label>
                    <div className="d-flex p-1 bg-light rounded" style={{ borderRadius: '2rem' }}>
                      <button type="button" className={`btn ${editingUser.role === 'user' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem' }} onClick={() => setEditingUser({...editingUser, role: 'user'})}>👤 User</button>
                      <button type="button" className={`btn ${editingUser.role === 'admin' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem' }} onClick={() => setEditingUser({...editingUser, role: 'admin'})}>🛡️ Admin</button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label mb-2 d-block">Status</label>
                    <div className="d-flex p-1 bg-light rounded" style={{ borderRadius: '2rem' }}>
                      <button type="button" className={`btn ${editingUser.status === 'active' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem' }} onClick={() => setEditingUser({...editingUser, status: 'active'})}>✅ Active</button>
                      <button type="button" className={`btn ${editingUser.status === 'inactive' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem' }} onClick={() => setEditingUser({...editingUser, status: 'inactive'})}>⛔ Inact</button>
                    </div>
                  </div>
                </div>
              </div>

              {editingUser.role === 'user' && (
                <div className="mb-2">
                  <h4 className="mb-3 text-muted">C. Grade Access</h4>
                  <div className="form-group mb-3">
                    <label className="form-label">Board</label>
                    <div className="d-flex p-1 bg-light rounded" style={{ borderRadius: '2rem' }}>
                      <button type="button" className={`btn ${editingUser.assignedBoard === 'cbse' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem', flex: 1 }} onClick={() => setEditingUser({...editingUser, assignedBoard: 'cbse', assignedGrades: ['all']})}>CBSE</button>
                      <button type="button" className={`btn ${editingUser.assignedBoard === 'stateboard' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: '2rem', padding: '0.4rem 1rem', flex: 1 }} onClick={() => setEditingUser({...editingUser, assignedBoard: 'stateboard', assignedGrades: ['all']})}>State Board</button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Grades</label>
                    <div className="d-flex flex-wrap gap-2">
                      <button 
                        type="button" 
                        onClick={() => toggleGrade('all')}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: '1rem', border: '1px solid', fontSize: '0.85rem', cursor: 'pointer',
                          backgroundColor: editingUser.assignedGrades?.includes('all') ? 'var(--primary-navy)' : 'white',
                          color: editingUser.assignedGrades?.includes('all') ? 'white' : 'var(--text-dark)',
                          borderColor: editingUser.assignedGrades?.includes('all') ? 'var(--primary-navy)' : 'var(--border-light)'
                        }}
                      >
                        ✓ All Grades
                      </button>
                      {getBoardGrades(editingUser.assignedBoard).map(g => (
                        <button 
                          key={g.id} type="button" onClick={() => toggleGrade(g.id)}
                          style={{
                            padding: '0.4rem 0.8rem', borderRadius: '1rem', border: '1px solid', fontSize: '0.85rem', cursor: 'pointer',
                            backgroundColor: editingUser.assignedGrades?.includes(g.id) ? 'var(--primary-navy)' : 'white',
                            color: editingUser.assignedGrades?.includes(g.id) ? 'white' : 'var(--text-dark)',
                            borderColor: editingUser.assignedGrades?.includes(g.id) ? 'var(--primary-navy)' : 'var(--border-light)'
                          }}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-top d-flex gap-2 bg-light sticky-bottom">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save User</button>
              <button type="button" className="btn btn-ghost" onClick={handleCloseDrawer}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
