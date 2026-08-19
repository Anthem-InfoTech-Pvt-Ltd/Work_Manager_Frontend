'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { planApi } from '@/lib/api';
import { ShieldAlert } from 'lucide-react';
import { showToast } from '@/components/shared/ToastProvider';

interface Plan {
  id: number;
  name: string;
}

interface Workspace {
  id: number;
  name: string;
  ownerName?: string;
  planName?: string;
  memberCount?: number;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const userRole = user?.roles?.[0] ?? 'Admin';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error('Failed to load subscription details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadData();
    }
  }, [isSuperAdmin]);

  const handleAssignPlan = async (workspaceId: number, planId: number) => {
    setAssigningWorkspaceId(workspaceId);
    try {
      await planApi.assignWorkspacePlan(workspaceId, planId);
      await loadData();
      showToast.success('Workspace plan assigned successfully.');
    } catch (e) {
      console.error(e);
      showToast.error('Failed to assign workspace plan.');
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
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Account Subscriptions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            View active user accounts, monitor member growth, and assign subscription plans.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏢</span> Account Subscriptions
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owner Account</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Members</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Plan</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Assign Subscription</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{w.ownerName || w.name}</td>
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
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
