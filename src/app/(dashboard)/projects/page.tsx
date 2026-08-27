'use client';

import { useEffect, useState } from 'react';
import { projectsApi, boardsApi, usersApi, adminApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/shared/ToastProvider';
import Link from 'next/link';

interface Project {
  id: number; name: string; description?: string; color: string; status: string; priority: string; createdAt: string; ownerId: number; defaultBoardId?: number;
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
  const [form, setForm] = useState({ name: '', description: '', workspaceId: workspaceId || 1 });
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
    setLoading(true);

    const fetchProjects = async () => {
      try {
        const isSuperAdmin = user?.roles?.includes('Super Admin');
        if (isSuperAdmin) {
          const res = await adminApi.getPlatformSummary();
          setProjects(res.data.data?.projects ?? []);
        } else {
          const res = await projectsApi.getAll();
          setProjects(res.data.data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.id]);

  useEffect(() => {
    if (workspaceId) {
      setForm(f => ({ ...f, workspaceId }));
    }
  }, [workspaceId]);

  const createProject = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await projectsApi.create(form);
      const res = await projectsApi.getAll();
      setProjects(res.data.data ?? []);
      setShowCreate(false);
      setForm({ name: '', description: '', workspaceId: 1 });
      showToast.success('Project created successfully!');
    } catch (e: any) {
      if (e.response?.status === 429) {
        showToast.error(e.response.data?.message || 'Quota limit reached. Please upgrade your plan.');
      } else {
        showToast.error(e.response?.data?.message || 'Failed to create project.');
      }
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
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
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. E-Commerce Platform" autoFocus id="project-name" maxLength={50} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" rows={3} style={{ resize: 'none' }} id="project-desc" maxLength={200} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={createProject} disabled={saving || !form.name.trim()} style={{ flex: 1 }} id="save-project-btn">
                {saving ? 'Creating...' : 'Create Project'}
              </button>
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
                  className="select"
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
                      showToast.success('Member added to project');
                    } catch (e: any) {
                      console.error(e);
                      showToast.error(e.response?.data?.message || 'Failed to add member to project');
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
                          showToast.success('Member removed from project');
                        } catch (e: any) {
                          console.error(e);
                          showToast.error(e.response?.data?.message || 'Failed to remove member');
                        }
                      }}
                      className="btn btn-danger-outline btn-xs"
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
  const [boards, setBoards] = useState<{ id: number; name: string }[]>([]);

  const loadBoards = async () => {
    if (project.defaultBoardId) return;
    try {
      const res = await boardsApi.getByProject(project.id);
      setBoards(res.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadBoards();
  }, [project.id, project.defaultBoardId]);

  const st = statusBadge[project.status] ?? statusBadge.active;
  const defaultBoardId = project.defaultBoardId || boards[0]?.id;

  const cardContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          📁
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{project.name}</h3>
      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          {project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </>
  );

  if (defaultBoardId) {
    return (
      <Link href={`/boards/${defaultBoardId}`} className="card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s, box-shadow 0.2s' }}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="card" style={{ padding: 24, opacity: 0.8 }}>
      {cardContent}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 12 }}>Setting up project stages...</p>
    </div>
  );
}
