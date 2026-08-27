'use client';

import { useEffect, useState } from 'react';
import { usersApi, authApi } from '@/lib/api';
import { showToast, ConfirmModal } from '@/components/shared/ToastProvider';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal / Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Create User state
  const [isCreating, setIsCreating] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Regex check for email format
    if (!EMAIL_REGEX.test(newEmail.trim())) {
      const errMsg = 'Please enter a valid email address.';
      setCreateError(errMsg);
      showToast.error(errMsg);
      return;
    }

    try {
      setCreateSaving(true);
      setCreateError(null);
      const res = await authApi.register({
        email: newEmail.trim(),
        password: newPassword,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
      });

      if (res.data.success) {
        setCreateSuccess(true);
        showToast.success('User created successfully.');
        setTimeout(() => {
          setIsCreating(false);
          setNewFirstName('');
          setNewLastName('');
          setNewEmail('');
          setNewPassword('');
          setCreateSuccess(false);
          fetchUsers();
        }, 1000);
      } else {
        const errMsg = res.data.message || 'Failed to create user.';
        setCreateError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred while creating the user.';
      setCreateError(errMsg);
      showToast.error(errMsg);
    } finally {
      setCreateSaving(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAll();
      if (res.data.success) {
        setUsers(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch users.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setRole(user.role);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaving(true);
      setSaveError(null);
      const res = await usersApi.update(editingUser.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'admin', // Always use 'admin' role and don't allow modifying it
      });

      if (res.data.success) {
        setSaveSuccess(true);
        showToast.success('User updated successfully.');
        setTimeout(() => {
          closeEditModal();
          fetchUsers();
        }, 1000);
      } else {
        const errMsg = res.data.message || 'Failed to update user.';
        setSaveError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred while updating the user.';
      setSaveError(errMsg);
      showToast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User?',
      message: `Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await usersApi.delete(id);
          if (res.data.success) {
            showToast.success('User deleted successfully.');
            fetchUsers();
          } else {
            showToast.error(res.data.message || 'Failed to delete user.');
          }
        } catch (err: any) {
          showToast.error(err.response?.data?.message || 'An error occurred while deleting the user.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredUsers = users.filter(user => {
    const isSuperAdmin = user.role.toLowerCase() === 'super_admin' || user.role.toLowerCase() === 'superadmin';
    if (isSuperAdmin) return false;

    const term = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  const getRoleBadgeStyle = (userRole: string) => {
    const base = {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      display: 'inline-block',
    };

    switch (userRole.toLowerCase()) {
      case 'super_admin':
      case 'superadmin':
        return { ...base, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'admin':
        return { ...base, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
      case 'manager':
        return { ...base, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'developer':
        return { ...base, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'qa':
        return { ...base, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default:
        return { ...base, background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Manage organization members and update user details.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setCreateError(null);
            setCreateSuccess(false);
          }}
          className="btn btn-primary"
        >
          Create User
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={searchTerm}
            maxLength={50}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>
      </div>

      {/* Main Table Card */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{
            width: 32, height: 32, border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--danger)', display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Error Loading Users</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{error}</p>
          </div>
        </div>
      ) : (
        <div className="card table-container" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    No users match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="table-row-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'var(--gradient-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: '#fff',
                          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                        }}>
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{user.fullName}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {user.role.toLowerCase() !== 'super_admin' && (
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            className="btn btn-danger-outline btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Drawer / Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'flex-end',
          zIndex: 1000, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }} onClick={closeEditModal}>
          <div style={{
            width: '100%', maxWidth: 460, background: 'var(--bg-card)',
            height: '100%', padding: '40px 32px', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Edit User Details</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                  Updating user profile details for {editingUser.email}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4, fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="input"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Drawer / Modal */}
      {isCreating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'flex-end',
          zIndex: 1000, backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setIsCreating(false)}>
          <div style={{
            width: '100%', maxWidth: 460, background: 'var(--bg-card)',
            height: '100%', padding: '40px 32px', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Create User</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                  Add a new member to the platform (Admin role assigned by default)
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 4, fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="input"
                  value={newFirstName}
                  onChange={e => setNewFirstName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="input"
                  value={newLastName}
                  onChange={e => setNewLastName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  maxLength={50}
                  className="input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  maxLength={50}
                  className="input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {createSaving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spin and animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .table-row-hover:hover { background-color: var(--bg-hover) !important; }
      `}</style>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
