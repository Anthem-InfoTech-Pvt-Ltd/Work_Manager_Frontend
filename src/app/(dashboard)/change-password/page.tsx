'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

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
      {/* Back Button & Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 16,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Profile
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Change Password</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Update your account password to stay secure.</p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Security Settings</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enter your current password and your new password below.</p>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Current Password
            </label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              maxLength={50}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                New Password
              </label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                maxLength={50}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                maxLength={50}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={changing}>
              {changing ? 'Updating Password...' : 'Update Password'}
            </button>
            <Link
              href="/profile"
              className="btn btn-ghost"
              style={{ textDecoration: 'none', justifyContent: 'center' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
