'use client';

import { useEffect, useState } from 'react';
import { rolesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Role { id: number; name: string; color: string; description?: string; isSystem: boolean; }
interface Permission { id: number; module: string; action: string; key: string; description?: string; }

export default function RolesPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Super Admin') || user?.roles?.includes('Admin');

  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#6366f1' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([rolesApi.getAll(), rolesApi.getPermissions()])
      .then(([r, p]) => { setRoles(r.data.data); setPerms(p.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const selectRole = async (r: Role) => {
    setSelected(r);
    try {
      const res = await rolesApi.getRolePermissions(r.id);
      const permIds = (res.data.data ?? []).map((p: any) => p.id);
      setSelectedPerms(permIds);
    } catch (e) {
      console.error(e);
      setSelectedPerms([]);
    }
  };

  const createRole = async () => {
    await rolesApi.create(newRole);
    const res = await rolesApi.getAll();
    setRoles(res.data.data);
    setShowCreate(false);
    setNewRole({ name: '', description: '', color: '#6366f1' });
  };

  const savePermissions = async () => {
    if (!selected) return;
    await rolesApi.setPermissions(selected.id, selectedPerms);
    alert('Permissions saved!');
  };

  const groupedPerms = perms.reduce((acc: Record<string, Permission[]>, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1400, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Roles & Permissions</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Manage roles and assign granular user capabilities.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Roles list */}
        <div className="card" style={{ padding: 24, alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Workspace Roles</h3>
            {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ New Role</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />) :
            roles.map(r => (
              <div key={r.id} onClick={() => selectRole(r)} style={{
                padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                background: selected?.id === r.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                border: `1px solid ${selected?.id === r.id ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.name}</span>
                  {r.isSystem && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 6, marginLeft: 'auto', fontWeight: 600 }}>SYSTEM</span>}
                </div>
                {r.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>{r.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions for selected role */}
        <div>
          {selected ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Permissions for: <span style={{ color: 'var(--accent)' }}>{selected.name}</span></h3>
                {isAdmin && <button className="btn btn-primary btn-sm" onClick={savePermissions}>Save Changes</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(groupedPerms).map(([module, modulePerms]) => (
                  <div key={module} className="card" style={{ padding: 24 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 16 }}>{module}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                      {modulePerms.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isAdmin ? 'pointer' : 'default', fontSize: 13, userSelect: 'none', color: 'var(--text-secondary)' }}>
                          <input type="checkbox"
                            disabled={!isAdmin}
                            checked={selectedPerms.includes(p.id)}
                            onChange={e => {
                              if (!isAdmin) return;
                              setSelectedPerms(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                            }}
                            style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                          />
                          <span>{p.description ?? `${p.module}.${p.action}`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--text-muted)', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: 44, marginBottom: 16 }}>🛡️</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Select a Role</p>
                <p>Click any role from the sidebar roster to configure RBAC permissions.</p>
              </div>
            </div>
          )}
        </div>

        {/* Create role modal */}
        {showCreate && (
          <>
            <div className="overlay" onClick={() => setShowCreate(false)} />
            <div className="card fade-in" style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 1000, width: 420, maxWidth: '90vw', padding: 36, background: 'var(--bg-card)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Create New Role</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input className="input" placeholder="Role name" value={newRole.name} onChange={e => setNewRole(n => ({ ...n, name: e.target.value }))} autoFocus />
                <input className="input" placeholder="Description (optional)" value={newRole.description} onChange={e => setNewRole(n => ({ ...n, description: e.target.value }))} />
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Color</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['#6366f1','#22c55e','#f59e0b','#ef4444','#ec4899','#3b82f6','#8b5cf6','#6b7280'].map(c => (
                      <button key={c} onClick={() => setNewRole(n => ({ ...n, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: newRole.color === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={createRole} disabled={!newRole.name.trim()} style={{ flex: 1 }}>Create Role</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
