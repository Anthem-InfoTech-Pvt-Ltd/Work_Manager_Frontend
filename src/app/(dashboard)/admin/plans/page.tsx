'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { planApi } from '@/lib/api';
import { ShieldAlert, Edit2, Check } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxBoardsPerProject: number;
  maxMembersPerWorkspace: number;
}

export default function PlansPage() {
  const { user } = useAuth();
  const userRole = user?.roles?.[0] ?? 'Admin';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<{
    maxWorkspaces: number;
    maxProjects: number;
    maxBoards: number;
    maxMembers: number;
  } | null>(null);

  const [savingPlanId, setSavingPlanId] = useState<number | null>(null);
  const isSuperAdmin = userRole === 'Super Admin';

  const loadPlans = async () => {
    setLoading(true);
    try {
      const plansRes = await planApi.getPlans();
      setPlans(plansRes.data.data ?? []);
    } catch (e) {
      console.error('Failed to load plan limits', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadPlans();
    }
  }, [isSuperAdmin]);

  const handleStartEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditingForm({
      maxWorkspaces: plan.maxWorkspaces, // Keep these fields in form so the API payloads stay happy
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
      await loadPlans();
    } catch (e) {
      console.error(e);
      alert('Failed to update plan limits.');
    } finally {
      setSavingPlanId(null);
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Plan Limits</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Define custom thresholds and limits for projects and members.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 250, borderRadius: 12 }} />
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💎</span> Subscription Plans & Limits
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan Name</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Projects</th>
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
      )}
    </div>
  );
}
