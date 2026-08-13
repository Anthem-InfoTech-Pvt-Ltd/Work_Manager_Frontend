'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { workspacesApi, usersApi, projectsApi, boardsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Workspace {
  id: number;
  name: string;
  createdAt: string;
}

interface Board {
  id: number;
  projectId: number;
  name: string;
  description?: string;
}

interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  createdAt: string;
  boards?: Board[];
}

interface SystemUser {
  id: number;
  email: string;
  fullName: string;
}

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  
  const [loadingWs, setLoadingWs] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modals & Forms
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  
  const [showCreateProjModal, setShowCreateProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Board Members Modal states
  const [selectedBoardForMembers, setSelectedBoardForMembers] = useState<Board | null>(null);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loadingBoardMembers, setLoadingBoardMembers] = useState(false);
  const [selectedAddUserId, setSelectedAddUserId] = useState<string>('');

  // Fetch workspaces & all users
  useEffect(() => {
    if (!isSuperAdmin) return;
    loadWorkspaces();
    loadSystemUsers();
  }, [isSuperAdmin]);

  // Fetch workspace details when selection changes
  useEffect(() => {
    if (selectedWs) {
      loadWorkspaceDetails(selectedWs.id);
    } else {
      setProjects([]);
    }
  }, [selectedWs]);

  const loadWorkspaces = async () => {
    setLoadingWs(true);
    try {
      const res = await workspacesApi.getAll();
      const list = res.data.data || [];
      setWorkspaces(list);
      if (list.length > 0 && !selectedWs) {
        setSelectedWs(list[0]);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setLoadingWs(false);
    }
  };

  const loadSystemUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setSystemUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load system users', err);
    }
  };

  const loadWorkspaceDetails = async (wsId: number) => {
    setLoadingDetails(true);
    try {
      const projRes = await projectsApi.getAll(wsId);
      const projList = projRes.data.data || [];
      
      const projectsWithBoards = await Promise.all(
        projList.map(async (p: any) => {
          try {
            const boardsRes = await boardsApi.getByProject(p.id);
            return {
              ...p,
              boards: boardsRes.data.data || []
            };
          } catch (err) {
            console.error(`Failed to load boards for project ${p.id}`, err);
            return {
              ...p,
              boards: []
            };
          }
        })
      );
      setProjects(projectsWithBoards);
    } catch (err) {
      console.error('Failed to load workspace details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Board Members loading
  const loadBoardMembers = async (boardId: number) => {
    setLoadingBoardMembers(true);
    try {
      const res = await boardsApi.getMembers(boardId);
      setBoardMembers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load board members', err);
    } finally {
      setLoadingBoardMembers(false);
    }
  };

  useEffect(() => {
    if (selectedBoardForMembers) {
      loadBoardMembers(selectedBoardForMembers.id);
    } else {
      setBoardMembers([]);
    }
  }, [selectedBoardForMembers]);

  // Workspace Actions
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const res = await workspacesApi.create({ name: newWsName });
      const newWs = res.data.data;
      setWorkspaces(prev => [...prev, newWs]);
      setSelectedWs(newWs);
      setNewWsName('');
      setShowCreateWsModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create workspace');
    }
  };

  const handleDeleteWorkspace = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All projects, boards, and tasks will be deleted.`)) return;
    try {
      await workspacesApi.delete(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (selectedWs?.id === id) {
        setSelectedWs(workspaces.find(w => w.id !== id) || null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete workspace.');
    }
  };

  // Project Actions
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWs || !newProjName.trim()) return;
    try {
      await projectsApi.create({
        workspaceId: selectedWs.id,
        name: newProjName,
        description: newProjDesc
      });
      setNewProjName('');
      setNewProjDesc('');
      setShowCreateProjModal(false);
      loadWorkspaceDetails(selectedWs.id);
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (projId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;
    try {
      await projectsApi.delete(projId);
      setProjects(prev => prev.filter(p => p.id !== projId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  // Board Member Actions
  const handleAddBoardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoardForMembers || !selectedAddUserId) return;
    try {
      const userId = parseInt(selectedAddUserId, 10);
      await boardsApi.addMember(selectedBoardForMembers.id, { userId });
      setSelectedAddUserId('');
      loadBoardMembers(selectedBoardForMembers.id);
    } catch (err) {
      console.error(err);
      alert('Failed to add member to board');
    }
  };

  const handleRemoveBoardMember = async (userId: number, name: string) => {
    if (!selectedBoardForMembers) return;
    if (!confirm(`Remove ${name} from this board?`)) return;
    try {
      await boardsApi.removeMember(selectedBoardForMembers.id, userId);
      setBoardMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (err) {
      console.error(err);
      alert('Failed to remove member from board');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Super Admin privileges required.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Dashboard</Link>
      </div>
    );
  }

  const currentMemberIds = new Set(boardMembers.map(m => m.userId));
  const addableUsers = systemUsers.filter(u => !currentMemberIds.has(u.id));

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Workspace & Projects Administrator</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Manage system-wide workspaces, projects, boards, and their members.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateWsModal(true)}>
            + Create Workspace
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Sidebar: Workspaces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Workspaces</h3>
          {loadingWs ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading workspaces...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workspaces.map(ws => {
                const isActive = selectedWs?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    onClick={() => setSelectedWs(ws)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: isActive ? 'var(--primary-light-alpha, #3b82f60a)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ws.name}
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>ID: {ws.id}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(ws.id, ws.name);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', padding: 6 }}
                      title="Delete Workspace"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects List Panel */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
          {selectedWs ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Projects in {selectedWs.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    Manage workspace projects and board memberships.
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreateProjModal(true)}>
                  + Create Project
                </button>
              </div>

              {loadingDetails ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading projects...</div>
              ) : projects.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No projects in this workspace yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {projects.map(p => (
                    <div key={p.id} className="card" style={{ padding: 18, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                          <button
                            onClick={() => handleDeleteProject(p.id, p.name)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                          >
                            Delete
                          </button>
                        </div>
                        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {p.description || 'No description.'}
                        </p>

                        {/* Project Boards & Member management */}
                        <div style={{ marginTop: 12, borderTop: '1px solid var(--border-light, #f1f5f90d)', paddingTop: 12 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Boards ({p.boards?.length || 0})
                          </p>
                          {p.boards && p.boards.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {p.boards.map(b => (
                                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 8, backgroundColor: 'var(--bg-input, #f8fafc0a)' }}>
                                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{b.name}</span>
                                  <button
                                    onClick={() => setSelectedBoardForMembers(b)}
                                    className="btn btn-secondary btn-xs"
                                    style={{ padding: '3px 8px', fontSize: 11 }}
                                  >
                                    👥 Members
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No boards in this project yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Select a workspace to view and manage its projects.
            </div>
          )}
        </div>
      </div>

      {/* Workspace Creation Modal */}
      {showCreateWsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Create New Workspace</h3>
            <form onSubmit={handleCreateWorkspace}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finance Ops"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateWsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {showCreateProjModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration Phase 1"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 14
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                <textarea
                  placeholder="Describe your project"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    minHeight: 80
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateProjModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Board Members Modal */}
      {selectedBoardForMembers && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 500, padding: 24, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                Members of Board: {selectedBoardForMembers.name}
              </h3>
              <button
                onClick={() => setSelectedBoardForMembers(null)}
                style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>

            {/* Add Member form */}
            <form onSubmit={handleAddBoardMember} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <select
                required
                value={selectedAddUserId}
                onChange={(e) => setSelectedAddUserId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 14
                }}
              >
                <option value="">-- Add User to Board --</option>
                {addableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" disabled={!selectedAddUserId}>Add</button>
            </form>

            {loadingBoardMembers ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading members...</div>
            ) : boardMembers.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text-secondary)' }}>
                No members assigned to this board yet.
              </div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px', fontSize: 13, color: 'var(--text-secondary)' }}>Name</th>
                      <th style={{ padding: '8px', fontSize: 13, color: 'var(--text-secondary)' }}>Email</th>
                      <th style={{ padding: '8px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardMembers.map(m => (
                      <tr key={m.userId} style={{ borderBottom: '1px solid var(--border-light, #f1f5f90d)' }}>
                        <td style={{ padding: '10px 8px', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
                          {m.userName || `User #${m.userId}`}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: 14 }}>
                          {m.userEmail || '-'}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveBoardMember(m.userId, m.userName || '')}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
