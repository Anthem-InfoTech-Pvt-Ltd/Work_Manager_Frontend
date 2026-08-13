'use client';

import { useEffect, useState } from 'react';
import { usersApi, authApi, rolesApi, workspacesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface UserDto {
  id: number;
  email: string;
  fullName: string;
  jobTitle?: string;
  isActive: boolean;
  roles?: string[];
}

export default function MembersPage() {
  const { user: currentUser, workspaceId } = useAuth();
  const currentUserRole = currentUser?.roles?.[0] ?? 'Admin';
  const isAdmin = currentUserRole === 'Super Admin' || currentUserRole === 'Admin';

  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState<{ id: number; name: string }[]>([]);

  // Add member modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([
      usersApi.getAll(workspaceId).then(res => setUsers(res.data.data)),
      rolesApi.getAll().then(res => setAllRoles(res.data.data))
    ])
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [workspaceId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      const regRes = await authApi.register({ email, password, firstName, lastName });
      const userId = regRes.data.data.user.id;
      
      // Assign selected role if not default Admin
      if (selectedRole !== 'Admin') {
        await usersApi.assignRoles(userId, [selectedRole]);
      }

      // Add the user to the current workspace
      if (workspaceId) {
        await workspacesApi.addMember(workspaceId, { userId });
      }

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setSelectedRole('Admin');
      setShowAddModal(false);
      
      // Reload users list
      setLoading(true);
      const res = await usersApi.getAll(workspaceId || undefined);
      setUsers(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRoleName: string) => {
    try {
      await usersApi.assignRoles(userId, [newRoleName]);
      // Update local state optimistically
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: [newRoleName] } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update member role');
    }
  };

  const isSuperAdmin = currentUserRole === 'Super Admin';

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Super Admin privileges required to manage workspace members.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Workspace Members</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage your team members and roles inside this workspace.
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Member
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['User', 'Email', 'Job Title', 'Role', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="skeleton" style={{ height: 40, margin: 8 }} /></td></tr>
            ) : users.filter(u => {
              const isUserSuperAdmin = u.roles?.includes('Super Admin');
              const isUserAdmin = u.roles?.includes('Admin');
              if (isUserSuperAdmin) return u.id === currentUser?.id;
              if (isUserAdmin) {
                if (currentUserRole === 'Super Admin') return true;
                if (currentUserRole === 'Admin') return u.id === currentUser?.id;
                return false;
              }
              return true;
            }).map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {u.fullName?.[0]}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.jobTitle ?? 'Team Member'}</td>
                <td style={{ padding: '12px 14px' }}>
                  {isAdmin ? (
                    <select
                      value={u.roles?.[0] ?? 'Admin'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {allRoles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: 'rgba(99,102,241,0.12)', color: 'var(--accent)'
                    }}>
                      {u.roles?.[0] ?? 'Admin'}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: u.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: u.isActive ? '#4ade80' : '#f87171',
                  }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 32, background: 'var(--bg-card)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Add New Member</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Enter user details to register them to the workspace.</p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
                  <input className="input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
                  <input className="input" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email Address</label>
                <input className="input" type="email" placeholder="john.doe@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
                <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Role</label>
                <select className="input" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  {allRoles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
