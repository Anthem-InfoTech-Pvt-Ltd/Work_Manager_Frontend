'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { usersApi, authApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

export default function ProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await usersApi.update(user.id, { firstName, lastName });
      showToast.success('Profile updated successfully!');
    } catch {
      showToast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast.error("New passwords do not match.");
      return;
    }
    setChanging(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      showToast.success("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 700, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>My Profile</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Manage your personal details and account information.</p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff',
          }}>
            {firstName[0]}{lastName[0]}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{user?.fullName}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {user?.roles.includes('Super Admin') && (
                <span style={{ padding: '2px 8px', borderRadius: 12, background: 'var(--bg-hover)', fontSize: 11, fontWeight: 600 }}>Super Admin</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
              <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} required maxLength={50} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
              <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} required maxLength={50} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 28, marginTop: 24 }}>
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Security</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Update your account password to stay secure.</p>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Current Password</label>
            <input type="password" className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required maxLength={50} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>New Password</label>
              <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required maxLength={50} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Confirm New Password</label>
              <input type="password" className="input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={50} />
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} disabled={changing}>
            {changing ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
