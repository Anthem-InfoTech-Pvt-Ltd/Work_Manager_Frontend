'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, projectsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { showToast, ConfirmModal } from '@/components/shared/ToastProvider';
import { validateRequired } from '@/lib/validation';
import { useRouter } from 'next/navigation';

interface WorkspaceItem {
  id: number;
  name: string;
}

interface ProjectItem {
  id: number;
  workspaceId: number;
  workspaceName: string;
  ownerId: number;
  ownerName: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface UserItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export default function PlatformManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Data state
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', workspaceId: '', ownerId: '' });

  // Members Modal state
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [addingMemberUserId, setAddingMemberUserId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // Redirect if not Super Admin
  useEffect(() => {
    if (user && !user.roles?.includes('Super Admin')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getPlatformSummary();
      if (res.data.success) {
        setWorkspaces(res.data.data.workspaces || []);
        setProjects(res.data.data.projects || []);
        setUsers(res.data.data.users || []);
      } else {
        setError(res.data.message || 'Failed to load summary data.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.roles?.includes('Super Admin')) {
      fetchData();
    }
  }, [user]);

  // -- MEMBERS MANAGEMENT --
  const handleOpenMembersModal = async (project: ProjectItem) => {
    setSelectedProject(project);
    setIsMembersModalOpen(true);
    setAddingMemberUserId('');
    setActionError(null);
    try {
      const res = await projectsApi.getMembers(project.id);
      if (res.data.success) {
        setMembers(res.data.data || []);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to load project members.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingMemberUserId || !selectedProject) return;
    setActionError(null);
    try {
      const res = await projectsApi.addMember(selectedProject.id, Number(addingMemberUserId));
      if (res.data.success) {
        handleOpenMembersModal(selectedProject);
      } else {
        setActionError(res.data.message || 'Failed to add member.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error.');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedProject) return;
    setActionError(null);
    try {
      const res = await projectsApi.removeMember(selectedProject.id, userId);
      if (res.data.success) {
        handleOpenMembersModal(selectedProject);
      } else {
        setActionError(res.data.message || 'Failed to remove member.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error.');
    }
  };

  // -- PROJECT ACTIONS --
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const trimmedName = projectForm.name.trim();
    const nameErr = validateRequired(trimmedName, 'a project name');
    if (nameErr) {
      setActionError(nameErr);
      showToast.error(nameErr);
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: trimmedName,
        description: projectForm.description.trim(),
        workspaceId: Number(projectForm.workspaceId || workspaces[0]?.id || 1),
        ownerId: Number(projectForm.ownerId || users[0]?.id || 1)
      };

      if (editingProject) {
        const res = await projectsApi.update(editingProject.id, data);
        if (res.data.success) {
          setIsProjectModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to update project.');
        }
      } else {
        const res = await projectsApi.create(data);
        if (res.data.success) {
          setIsProjectModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to create project.');
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number, name: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete project "${name}"? This deletes all associated boards and tasks.`,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await projectsApi.delete(id);
          if (res.data.success) {
            showToast.success('Project deleted successfully.');
            fetchData();
          } else {
            showToast.error(res.data.message || 'Failed to delete project.');
          }
        } catch (err: any) {
          showToast.error(err.response?.data?.message || 'Server error.');
        }
      },
    });
  };

  if (!user || !user.roles?.includes('Super Admin')) {
    return <div style={{ padding: 24 }}>Access Denied</div>;
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Platform Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 15 }}>Manage global platform projects, project owners, and member access.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--danger)' }}>
          <p style={{ fontWeight: 600 }}>Error loading platform data</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{error}</p>
        </div>
      ) : (
        <div className="card table-container" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>All Projects</h3>
            <button
              onClick={() => {
                setActionError(null);
                setEditingProject(null);
                setProjectForm({ name: '', description: '', workspaceId: workspaces[0]?.id.toString() || '1', ownerId: users[0]?.id.toString() || '' });
                setIsProjectModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              + Add Project
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Owner</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No projects found on the platform.
                  </td>
                </tr>
              ) : (
                projects.map(p => (
                  <tr key={p.id} className="table-row-hover">
                    <td style={{ fontWeight: 600 }}>
                      <div>
                        <span>{p.name}</span>
                        {p.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>{p.description}</p>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.ownerName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenMembersModal(p)}
                          className="btn btn-secondary btn-sm"
                        >
                          Members
                        </button>
                        <button
                          onClick={() => {
                            setActionError(null);
                            setEditingProject(p);
                            setProjectForm({ name: p.name, description: p.description || '', workspaceId: p.workspaceId.toString(), ownerId: p.ownerId.toString() });
                            setIsProjectModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="btn btn-danger-outline btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- PROJECT MODAL --- */}
      {isProjectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 460, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{editingProject ? 'Edit Project' : 'Create Project'}</h3>
            {actionError && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 16
              }}>
                {actionError}
              </div>
            )}
            <form onSubmit={handleSaveProject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Project Name</label>
                <input
                  type="text"
                  className="input"
                  value={projectForm.name}
                  onChange={e => {
                    setProjectForm({ ...projectForm, name: e.target.value });
                    if (actionError) setActionError(null);
                  }}
                  placeholder="e.g. Website Redesign"
                  maxLength={50}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Description</label>
                <textarea
                  className="input"
                  value={projectForm.description}
                  onChange={e => {
                    setProjectForm({ ...projectForm, description: e.target.value });
                    if (actionError) setActionError(null);
                  }}
                  style={{ resize: 'none' }}
                  rows={3}
                  placeholder="Brief description of the project"
                  maxLength={200}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Owner (Super Admin / Admin)</label>
                <select
                  className="select"
                  value={projectForm.ownerId}
                  onChange={e => setProjectForm({ ...projectForm, ownerId: e.target.value })}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MEMBERS MODAL --- */}
      {isMembersModalOpen && selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 500, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Project Members</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Managing members for <strong>{selectedProject.name}</strong>
            </p>
            {actionError && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 16
              }}>
                {actionError}
              </div>
            )}

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <select
                className="select"
                value={addingMemberUserId}
                onChange={e => {
                  setAddingMemberUserId(e.target.value);
                  if (actionError) setActionError(null);
                }}
                style={{ flex: 1 }}
              >
                <option value="">-- Select user to add --</option>
                {users
                  .filter(u => !members.some(m => m.userId === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
              </select>
              <button type="submit" className="btn btn-primary">Add</button>
            </form>

            {/* Members List */}
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 24, border: '1px solid var(--border)', borderRadius: 8 }}>
              {members.length === 0 ? (
                <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No extra members in this project.</p>
              ) : (
                members.map(member => {
                  const isOwner = member.userId === selectedProject.ownerId;
                  return (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {member.userName}
                          {isOwner && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 10 }}>Owner</span>}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.userEmail}</p>
                      </div>
                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId)}
                          style={{ padding: '4px 8px', borderRadius: 6, background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsMembersModalOpen(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
