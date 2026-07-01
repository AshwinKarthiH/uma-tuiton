import { useState, useEffect } from 'react';
import { getSession, saveSession } from '../../utils/auth';
import api from '../../api/axios';

export default function AdminProfile() {
  const session = getSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.name);
      setEmail(session.email);
    }
  }, [session?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password to save changes.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = { name, email, currentPassword };
      if (newPassword) {
        data.password = newPassword;
      }
      
      await api.patch(`/users/${session.id}/`, data);
      
      // Update local session data with new name/email
      saveSession({ ...session, name, email }, localStorage.getItem('uma_access_token'), localStorage.getItem('uma_refresh_token'));
      
      setMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-center py-4">
      <div className="card w-full" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4 border-bottom pb-4">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem', color: 'white', margin: '0 auto 1rem' }}>
            {name.charAt(0) || 'A'}
          </div>
          <h2 className="h2 m-0">Admin Profile</h2>
        </div>

        {error && <div className="badge badge-red w-full p-2 mb-4 d-block text-center">{error}</div>}
        {message && <div className="badge badge-green w-full p-2 mb-4 d-block text-center">{message}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Current Password (Required to save)</label>
            <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>

          <div className="border-top pt-3 mt-4">
            <h4 className="mb-3 text-muted">Change Password (Optional)</h4>
            
            <div className="form-group mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full p-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
