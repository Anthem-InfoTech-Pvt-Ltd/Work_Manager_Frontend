'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { planApi } from '@/lib/api';
import { ShieldAlert, CheckCircle, ShieldQuestion, Edit2, Check } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxBoardsPerProject: number;
  maxMembersPerWorkspace: number;
}

interface Workspace {
  id: number;
  name: string;
  ownerName?: string;
  planName?: string;
  memberCount?: number;
}

export default function PlanManagementPage() {
  const { user } = useAuth();
  const userRole = user?.roles?.[0] ?? 'Admin';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<{
    maxWorkspaces: number;
    maxProjects: number;
    maxBoards: number;
    maxMembers: number;
  } | null>(null);

  const [savingPlanId, setSavingPlanId] = useState<number | null>(null);
  const [assigningWorkspaceId, setAssigningWorkspaceId] = useState<number | null>(null);

  const isSuperAdmin = userRole === 'Super Admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, workspacesRes] = await Promise.all([
        planApi.getPlans(),
        planApi.getWorkspaces(),
      ]);
      setPlans(plansRes.data.data ?? []);
      setWorkspaces(workspacesRes.data.data ?? []);
    } catch (e) {
      console.error('Failed to load plan management details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleStartEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditingForm({
      maxWorkspaces: plan.maxWorkspaces,
      maxProjects: plan.maxProjectsPerWorkspace,
      maxBoards: plan.maxBoardsPerProject,
      maxMembers: plan.maxMembersPerWorkspace,
    });
  };

  const handleSavePlan = async (id: number) => {
    if (!editingForm) return;
    setSavingPlanId(id);
    try {
      await planApi.updatePlanLimits(id, editingForm);
      setEditingPlanId(null);
      setEditingForm(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update plan limits.');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleAssignPlan = async (workspaceId: number, planId: number) => {
    setAssigningWorkspaceId(workspaceId);
    try {
      await planApi.assignWorkspacePlan(workspaceId, planId);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to assign workspace plan.');
    } finally {
      setAssigningWorkspaceId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16 }}>
        <ShieldAlert size={64} style={{ color: 'var(--danger)' }} />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            This portal is restricted to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Plan Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Define subscription tiers, customize system limits, and manage workspace subscriptions.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {/* Plan Limits Card */}
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💎</span> Subscription Plans & Limits
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan Name</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Workspaces</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Projects / WS</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Boards / Project</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Members (Excl. Owner)</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => {
                    const isEditing = editingPlanId === p.id;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                        <td style={{ padding: '16px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              className="input"
                              style={{ width: 80, padding: '4px 8px' }}
                              value={editingForm?.maxWorkspaces}
                              onChange={e => setEditingForm(f => f ? { ...f, maxWorkspaces: parseInt(e.target.value) || 0 } : null)}
                            />
                          ) : (
                            p.maxWorkspaces === 0 ? 'Unlimited' : p.maxWorkspaces
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              className="input"
                              style={{ width: 80, padding: '4px 8px' }}
                              value={editingForm?.maxProjects}
                              onChange={e => setEditingForm(f => f ? { ...f, maxProjects: parseInt(e.target.value) || 0 } : null)}
                            />
                          ) : (
                            p.maxProjectsPerWorkspace === 0 ? 'Unlimited' : p.maxProjectsPerWorkspace
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              className="input"
                              style={{ width: 80, padding: '4px 8px' }}
                              value={editingForm?.maxBoards}
                              onChange={e => setEditingForm(f => f ? { ...f, maxBoards: parseInt(e.target.value) || 0 } : null)}
                            />
                          ) : (
                            p.maxBoardsPerProject === 0 ? 'Unlimited' : p.maxBoardsPerProject
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              className="input"
                              style={{ width: 80, padding: '4px 8px' }}
                              value={editingForm?.maxMembers}
                              onChange={e => setEditingForm(f => f ? { ...f, maxMembers: parseInt(e.target.value) || 0 } : null)}
                            />
                          ) : (
                            p.maxMembersPerWorkspace === 0 ? 'Unlimited' : p.maxMembersPerWorkspace
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: '4px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={() => handleSavePlan(p.id)}
                                disabled={savingPlanId === p.id}
                              >
                                <Check size={14} /> Save
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', minWidth: 'auto' }}
                                onClick={() => { setEditingPlanId(null); setEditingForm(null); }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '4px 8px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              onClick={() => handleStartEdit(p)}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workspaces Subscriptions Card */}
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏢</span> Workspace Subscriptions
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workspace Name</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workspace Owner</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Members</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Plan</th>
                    <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Assign Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{w.ownerName || 'Unknown Owner'}</td>
                      <td style={{ padding: '16px' }}>{w.memberCount ?? 0} members</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: w.planName === 'Enterprise' ? 'rgba(139,92,246,0.15)' : w.planName === 'Premium' ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
                          color: w.planName === 'Enterprise' ? '#a78bfa' : w.planName === 'Premium' ? '#60a5fa' : '#9ca3af'
                        }}>
                          {w.planName || 'Free'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <select
                          className="input"
                          style={{ width: 140, display: 'inline-block', padding: '4px 8px', fontSize: 13 }}
                          value={plans.find(p => p.name === w.planName)?.id || 1}
                          disabled={assigningWorkspaceId === w.id}
                          onChange={(e) => handleAssignPlan(w.id, parseInt(e.target.value))}
                        >
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {workspaces.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No workspaces found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
