'use client';

import { useEffect, useState } from 'react';
import { projectsApi, boardsApi, usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Project {
  id: number; name: string; description?: string; color: string; status: string; priority: string; createdAt: string; ownerId: number;
}

const statusBadge: Record<string, { bg: string; color: string }> = {
  active:   { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  paused:   { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  archived: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  done:     { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
};

export default function ProjectsPage() {
  const { user, hasPermission, workspaceId } = useAuth();
  const canCreateProject = hasPermission('project.create') || user?.roles?.includes('Manager') || user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', priority: 'medium', workspaceId: workspaceId || 1 });
  const [saving, setSaving] = useState(false);

  // Project Members management states
  const [showMembers, setShowMembers] = useState<{ id: number; name: string } | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedAddUserId, setSelectedAddUserId] = useState<number | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const handleOpenMembers = async (projectId: number, name: string) => {
    setShowMembers({ id: projectId, name });
    setLoadingMembers(true);
    setSelectedAddUserId(null);
    try {
      const [membersRes, usersRes] = await Promise.all([
        projectsApi.getMembers(projectId),
        usersApi.getAll(workspaceId || undefined)
      ]);
      setProjectMembers(membersRes.data.data ?? []);
      setAllUsers(usersRes.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    projectsApi.getAll(workspaceId).then(res => setProjects(res.data.data ?? [])).finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      setForm(f => ({ ...f, workspaceId }));
    }
  }, [workspaceId]);

  const createProject = async () => {
    if (!form.name.trim() || !workspaceId) return;
    setSaving(true);
    await projectsApi.create({ ...form, workspaceId });
    const res = await projectsApi.getAll(workspaceId);
    setProjects(res.data.data ?? []);
    setShowCreate(false);
    setForm({ name: '', description: '', color: '#6366f1', priority: 'medium', workspaceId });
    setSaving(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {canCreateProject && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Project grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {projects.map(p => (
            <ProjectBoardNavigator key={p.id} project={p} onManageMembers={handleOpenMembers} />
          ))}
          {projects.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>📁</p>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>No projects yet</p>
              <p>Create your first project to get started</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
                Create Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 40, width: 480, maxWidth: '90vw',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Create New Project</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Project Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. E-Commerce Platform" autoFocus id="project-name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" rows={3} style={{ resize: 'none' }} id="project-desc" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Color</label>
                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    {['#6366f1','#22c55e','#f59e0b','#ef4444','#ec4899','#3b82f6'].map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                        width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: form.color === c ? '2px solid white' : '2px solid transparent',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-primary" onClick={createProject} disabled={saving || !form.name.trim()} style={{ flex: 1 }} id="save-project-btn">
                {saving ? 'Creating...' : 'Create Project'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Manage Project Members Modal */}
      {showMembers && (
        <div className="overlay" onClick={() => setShowMembers(null)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, width: 500, maxWidth: '90vw',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Manage Members</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              Project: <strong style={{ color: 'var(--text-primary)' }}>{showMembers.name}</strong>
            </p>

            {/* Add Member form */}
            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Add Member to Project
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  className="input"
                  value={selectedAddUserId || ''}
                  onChange={e => setSelectedAddUserId(Number(e.target.value) || null)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select a user...</option>
                  {allUsers
                    .filter(u => !projectMembers.some(pm => pm.userId === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                </select>
                <button
                  className="btn btn-primary"
                  disabled={!selectedAddUserId}
                  onClick={async () => {
                    if (!selectedAddUserId) return;
                    try {
                      await projectsApi.addMember(showMembers.id, selectedAddUserId);
                      setSelectedAddUserId(null);
                      const res = await projectsApi.getMembers(showMembers.id);
                      setProjectMembers(res.data.data ?? []);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Members List */}
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>
              Current Members ({projectMembers.length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', marginBottom: 24 }}>
              {loadingMembers ? (
                <div className="skeleton" style={{ height: 40 }} />
              ) : projectMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                  No members in this project yet.
                </p>
              ) : (
                projectMembers.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.userName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.userEmail}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await projectsApi.removeMember(showMembers.id, m.userId);
                          const res = await projectsApi.getMembers(showMembers.id);
                          setProjectMembers(res.data.data ?? []);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, padding: '4px 8px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowMembers(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectBoardNavigator({ project, onManageMembers }: { project: Project; onManageMembers: (projectId: number, name: string) => void }) {
  const { user } = useAuth();
  const canCreateBoard = user?.roles?.includes('Super Admin') || project.ownerId === user?.id;

  const [boards, setBoards] = useState<{ id: number; name: string }[]>([]);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);

  const loadBoards = async () => {
    try {
      const res = await boardsApi.getByProject(project.id);
      setBoards(res.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadBoards();
  }, [project.id]);

  const handleCreateBoard = async () => {
    if (!boardName.trim()) return;
    setCreatingBoard(true);
    try {
      await boardsApi.create({ projectId: project.id, name: boardName.trim() });
      setBoardName('');
      setShowAddBoard(false);
      await loadBoards();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingBoard(false);
    }
  };

  const st = statusBadge[project.status] ?? statusBadge.active;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Top accent */}
      <div style={{ height: 4, borderRadius: 4, background: project.color, margin: '-24px -24px 20px', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${project.color}22`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          📁
        </div>
        <span style={{ ...st, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {project.status}
        </span>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{project.name}</h3>
      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span className={`badge badge-priority-${project.priority}`}>{project.priority}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Boards */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Boards ({boards.length})</p>
          {canCreateBoard && (
            <button
              onClick={() => setShowAddBoard(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              + Add Board
            </button>
          )}
        </div>

        {boards.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {boards.map(b => (
              <Link key={b.id} href={`/boards/${b.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, fontSize: 13,
                color: 'var(--text-secondary)', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                {b.name}
                <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round"/>
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No boards in this project yet.</p>
        )}
      </div>

      {/* Add Board Modal */}
      {showAddBoard && (
        <div className="overlay" onClick={() => setShowAddBoard(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, width: 400, maxWidth: '90vw',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add Board to {project.name}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Board Name *</label>
                <input className="input" placeholder="e.g. Backlog Board" value={boardName} onChange={e => setBoardName(e.target.value)} autoFocus />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddBoard(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateBoard} disabled={creatingBoard || !boardName.trim()}>
                  {creatingBoard ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
