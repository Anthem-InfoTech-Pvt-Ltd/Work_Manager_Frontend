'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, workspacesApi, projectsApi, boardsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface WorkspaceItem {
  id: number;
  name: string;
  ownerId?: number;
  ownerName?: string;
  createdAt: string;
  memberCount: number;
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

interface BoardItem {
  id: number;
  projectId: number;
  projectName: string;
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
  const [activeTab, setActiveTab] = useState<'workspaces' | 'projects' | 'boards'>('workspaces');

  // Summary state
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Modals / Drawer State
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceItem | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', workspaceId: '', ownerId: '' });

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<BoardItem | null>(null);
  const [boardForm, setBoardForm] = useState({ name: '', description: '', projectId: '', ownerId: '' });

  // Workspace members manager modal state
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [memberModalType, setMemberModalType] = useState<'workspace' | 'project' | 'board'>('workspace');
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<BoardItem | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [addingMemberUserId, setAddingMemberUserId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        setBoards(res.data.data.boards || []);
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

  // -- WORKSPACE ACTIONS --
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      if (editingWorkspace) {
        const res = await workspacesApi.update(editingWorkspace.id, { name: workspaceName, ownerId: Number(workspaceOwnerId) });
        if (res.data.success) {
          setIsWorkspaceModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to update workspace.');
        }
      } else {
        const res = await workspacesApi.create({ name: workspaceName, ownerId: Number(workspaceOwnerId) });
        if (res.data.success) {
          setIsWorkspaceModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to create workspace.');
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete workspace "${name}"? All projects, boards, and tasks under this workspace will be deleted.`)) {
      try {
        const res = await workspacesApi.delete(id);
        if (res.data.success) {
          fetchData();
        } else {
          alert(res.data.message || 'Failed to delete workspace.');
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Server error.');
      }
    }
  };

  // -- MEMBERS MANAGEMENT --
  const handleOpenMembersModal = async (type: 'workspace' | 'project' | 'board', item: any) => {
    setMemberModalType(type);
    if (type === 'workspace') {
      setSelectedWorkspace(item);
      setSelectedProject(null);
      setSelectedBoard(null);
    } else if (type === 'project') {
      setSelectedWorkspace(null);
      setSelectedProject(item);
      setSelectedBoard(null);
    } else {
      setSelectedWorkspace(null);
      setSelectedProject(null);
      setSelectedBoard(item);
    }
    setIsMembersModalOpen(true);
    setAddingMemberUserId('');
    setActionError(null);
    try {
      let res;
      if (type === 'workspace') {
        res = await workspacesApi.getMembers(item.id);
      } else if (type === 'project') {
        res = await projectsApi.getMembers(item.id);
      } else {
        res = await boardsApi.getMembers(item.id);
      }
      if (res.data.success) {
        setWorkspaceMembers(res.data.data || []);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || `Failed to load ${type} members.`);
    }
  };

  const handleAddWorkspaceMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingMemberUserId) return;
    setActionError(null);
    try {
      let res;
      if (memberModalType === 'workspace') {
        if (!selectedWorkspace) return;
        res = await workspacesApi.addMember(selectedWorkspace.id, { userId: Number(addingMemberUserId) });
      } else if (memberModalType === 'project') {
        if (!selectedProject) return;
        res = await projectsApi.addMember(selectedProject.id, Number(addingMemberUserId));
      } else {
        if (!selectedBoard) return;
        res = await boardsApi.addMember(selectedBoard.id, { userId: Number(addingMemberUserId) });
      }

      if (res.data.success) {
        handleOpenMembersModal(memberModalType, selectedWorkspace || selectedProject || selectedBoard);
      } else {
        setActionError(res.data.message || 'Failed to add member.');
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error.');
    }
  };

  const handleRemoveWorkspaceMember = async (userId: number) => {
    setActionError(null);
    try {
      let res;
      if (memberModalType === 'workspace') {
        if (!selectedWorkspace) return;
        res = await workspacesApi.removeMember(selectedWorkspace.id, userId);
      } else if (memberModalType === 'project') {
        if (!selectedProject) return;
        res = await projectsApi.removeMember(selectedProject.id, userId);
      } else {
        if (!selectedBoard) return;
        res = await boardsApi.removeMember(selectedBoard.id, userId);
      }

      if (res.data.success) {
        handleOpenMembersModal(memberModalType, selectedWorkspace || selectedProject || selectedBoard);
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
    setSubmitting(true);
    try {
      const data = {
        name: projectForm.name,
        description: projectForm.description,
        workspaceId: Number(projectForm.workspaceId),
        ownerId: Number(projectForm.ownerId)
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
    if (confirm(`Are you sure you want to delete project "${name}"? This deletes all associated boards and tasks.`)) {
      try {
        const res = await projectsApi.delete(id);
        if (res.data.success) {
          fetchData();
        } else {
          alert(res.data.message || 'Failed to delete project.');
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Server error.');
      }
    }
  };

  // -- BOARD ACTIONS --
  const handleSaveBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      const data = {
        name: boardForm.name,
        description: boardForm.description,
        projectId: Number(boardForm.projectId),
        ownerId: Number(boardForm.ownerId)
      };

      if (editingBoard) {
        const res = await boardsApi.update(editingBoard.id, data);
        if (res.data.success) {
          setIsBoardModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to update board.');
        }
      } else {
        const res = await boardsApi.create(data);
        if (res.data.success) {
          setIsBoardModalOpen(false);
          fetchData();
        } else {
          setActionError(res.data.message || 'Failed to create board.');
        }
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBoard = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete board "${name}"? This will delete all lists and tasks.`)) {
      try {
        const res = await boardsApi.delete(id);
        if (res.data.success) {
          fetchData();
        } else {
          alert(res.data.message || 'Failed to delete board.');
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Server error.');
      }
    }
  };

  if (!user || !user.roles?.includes('Super Admin')) {
    return <div style={{ padding: 24 }}>Access Denied</div>;
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Platform Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 15 }}>Manage global workspaces, projects, boards, and members.</p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { title: 'Total Workspaces', val: workspaces.length, color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
          { title: 'Total Projects', val: projects.length, color: 'linear-gradient(135deg, #10b981, #047857)' },
          { title: 'Total Boards', val: boards.length, color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
          { title: 'Registered Users', val: users.length, color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
        ].map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: 24, background: stat.color, color: '#fff', border: 'none' }}>
            <p style={{ fontSize: 13, textTransform: 'uppercase', opacity: 0.8, fontWeight: 600, letterSpacing: '0.05em' }}>{stat.title}</p>
            <p style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 24 }}>
        {[
          { id: 'workspaces', label: 'Workspaces' },
          { id: 'projects', label: 'Projects' },
          { id: 'boards', label: 'Boards' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '12px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {t.label}
          </button>
        ))}
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
        <div>
          {/* Workspaces Tab */}
          {activeTab === 'workspaces' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 600, fontSize: 16 }}>All Workspaces</h3>
                <button
                  onClick={() => {
                    setEditingWorkspace(null);
                    setWorkspaceName('');
                    setWorkspaceOwnerId(users[0]?.id.toString() || '');
                    setIsWorkspaceModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  + Add Workspace
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-header)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '16px 24px' }}>Workspace Name</th>
                    <th style={{ padding: '16px 24px' }}>Owner</th>
                    <th style={{ padding: '16px 24px' }}>Members</th>
                    <th style={{ padding: '16px 24px' }}>Created Date</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map(ws => (
                    <tr key={ws.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600 }}>{ws.name}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{ws.ownerName || '-'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: 'var(--border)', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>
                          {ws.memberCount} members
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(ws.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleOpenMembersModal('workspace', ws)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Members
                          </button>
                          <button
                            onClick={() => {
                              setEditingWorkspace(ws);
                              setWorkspaceName(ws.name);
                              setWorkspaceOwnerId(ws.ownerId?.toString() || '');
                              setIsWorkspaceModalOpen(true);
                            }}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 600, fontSize: 16 }}>All Projects</h3>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setProjectForm({ name: '', description: '', workspaceId: workspaces[0]?.id.toString() || '', ownerId: users[0]?.id.toString() || '' });
                    setIsProjectModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  + Add Project
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-header)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '16px 24px' }}>Project Name</th>
                    <th style={{ padding: '16px 24px' }}>Workspace</th>
                    <th style={{ padding: '16px 24px' }}>Owner</th>
                    <th style={{ padding: '16px 24px' }}>Created Date</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                        <div>
                          <span>{p.name}</span>
                          {p.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>{p.description}</p>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{p.workspaceName}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{p.ownerName}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleOpenMembersModal('project', p)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Members
                          </button>
                          <button
                            onClick={() => {
                              setEditingProject(p);
                              setProjectForm({ name: p.name, description: p.description || '', workspaceId: p.workspaceId.toString(), ownerId: p.ownerId.toString() });
                              setIsProjectModalOpen(true);
                            }}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id, p.name)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Boards Tab */}
          {activeTab === 'boards' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 600, fontSize: 16 }}>All Boards</h3>
                <button
                  onClick={() => {
                    setEditingBoard(null);
                    setBoardForm({ name: '', description: '', projectId: projects[0]?.id.toString() || '', ownerId: users[0]?.id.toString() || '' });
                    setIsBoardModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  + Add Board
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-header)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <th style={{ padding: '16px 24px' }}>Board Name</th>
                    <th style={{ padding: '16px 24px' }}>Project</th>
                    <th style={{ padding: '16px 24px' }}>Owner</th>
                    <th style={{ padding: '16px 24px' }}>Created Date</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                        <div>
                          <span>{b.name}</span>
                          {b.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>{b.description}</p>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{b.projectName}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{b.ownerName}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleOpenMembersModal('board', b)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Members
                          </button>
                          <button
                            onClick={() => {
                              setEditingBoard(b);
                              setBoardForm({ name: b.name, description: b.description || '', projectId: b.projectId.toString(), ownerId: b.ownerId.toString() });
                              setIsBoardModalOpen(true);
                            }}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBoard(b.id, b.name)}
                            style={{ padding: '6px 12px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', fontSize: 12, cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- WORKSPACE MODAL --- */}
      {isWorkspaceModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 440, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{editingWorkspace ? 'Edit Workspace' : 'Create Workspace'}</h3>
            <form onSubmit={handleSaveWorkspace}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Workspace Name</label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Owner (Super Admin / Admin)</label>
                <select
                  required
                  value={workspaceOwnerId}
                  onChange={e => setWorkspaceOwnerId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
              {actionError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{actionError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setIsWorkspaceModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8 }}>
                  {submitting ? 'Saving...' : 'Save Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROJECT MODAL --- */}
      {isProjectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 460, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{editingProject ? 'Edit Project' : 'Create Project'}</h3>
            <form onSubmit={handleSaveProject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Project Name</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  style={{ width: '100%', height: 80, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', resize: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Workspace</label>
                <select
                  required
                  value={projectForm.workspaceId}
                  onChange={e => setProjectForm({ ...projectForm, workspaceId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  {workspaces.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Owner (Super Admin / Admin)</label>
                <select
                  required
                  value={projectForm.ownerId}
                  onChange={e => setProjectForm({ ...projectForm, ownerId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
              {actionError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{actionError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setIsProjectModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8 }}>
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BOARD MODAL --- */}
      {isBoardModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 460, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{editingBoard ? 'Edit Board' : 'Create Board'}</h3>
            <form onSubmit={handleSaveBoard}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Board Name</label>
                <input
                  type="text"
                  required
                  value={boardForm.name}
                  onChange={e => setBoardForm({ ...boardForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Description</label>
                <textarea
                  value={boardForm.description}
                  onChange={e => setBoardForm({ ...boardForm, description: e.target.value })}
                  style={{ width: '100%', height: 80, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', resize: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Parent Project</label>
                <select
                  required
                  value={boardForm.projectId}
                  onChange={e => setBoardForm({ ...boardForm, projectId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.workspaceName})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Owner (Super Admin / Admin)</label>
                <select
                  required
                  value={boardForm.ownerId}
                  onChange={e => setBoardForm({ ...boardForm, ownerId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>
              {actionError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{actionError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setIsBoardModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8 }}>
                  {submitting ? 'Saving...' : 'Save Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MEMBERS MODAL --- */}
      {isMembersModalOpen && (selectedWorkspace || selectedProject || selectedBoard) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: 500, padding: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textTransform: 'capitalize' }}>{memberModalType} Members</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Managing members for <strong>{selectedWorkspace?.name || selectedProject?.name || selectedBoard?.name}</strong>
            </p>

            {/* Add Member Form */}
            <form onSubmit={handleAddWorkspaceMember} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <select
                required
                value={addingMemberUserId}
                onChange={e => setAddingMemberUserId(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Add User to {memberModalType} --</option>
                {users
                  .filter(u => !workspaceMembers.some(m => m.userId === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
              </select>
              <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: 8 }}>Add</button>
            </form>

            {actionError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{actionError}</p>}

            {/* Members List */}
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 24, border: '1px solid var(--border)', borderRadius: 8 }}>
              {workspaceMembers.length === 0 ? (
                <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No members in this {memberModalType}.</p>
              ) : (
                workspaceMembers.map(member => (
                  <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{member.userName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.userEmail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkspaceMember(member.userId)}
                      style={{ padding: '4px 8px', borderRadius: 6, background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsMembersModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
