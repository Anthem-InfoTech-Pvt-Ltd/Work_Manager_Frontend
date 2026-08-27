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

interface UserSubscription {
  userId: number;
  ownerName: string;
  email: string;
  memberCount: number;
  planName: string;
  planId: number;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const userRole = user?.roles?.[0] ?? 'Admin';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);

  const isSuperAdmin = userRole === 'Super Admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, userSubsRes] = await Promise.all([
        planApi.getPlans(),
        planApi.getUserSubscriptions(),
      ]);
      setPlans(plansRes.data.data ?? []);
      setUserSubs(userSubsRes.data.data ?? []);
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

  const handleAssignPlan = async (userId: number, planId: number) => {
    setAssigningUserId(userId);
    try {
      await planApi.assignUserPlan(userId, planId);
      await loadData();
      showToast.success('User subscription plan assigned successfully.');
    } catch (e) {
      console.error(e);
      showToast.error('Failed to assign user subscription plan.');
    } finally {
      setAssigningUserId(null);
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
        <div className="card table-container" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏢</span> Account Subscriptions
            </h2>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Owner Account</th>
                <th>Current Plan</th>
                <th style={{ textAlign: 'right' }}>Assign Subscription</th>
              </tr>
            </thead>
            <tbody>
              {userSubs.map(u => (
                <tr key={u.userId} className="table-row-hover">
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.ownerName || 'User'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: u.planName === 'Enterprise' ? 'var(--gradient-primary)' : u.planName === 'Premium' ? 'var(--gradient-secondary)' : 'var(--bg-hover)',
                      color: u.planName === 'Enterprise' || u.planName === 'Premium' ? '#fff' : 'var(--text-secondary)',
                    }}>
                      {u.planName || 'Free'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      className="select"
                      style={{ width: 160, display: 'inline-block', padding: '6px 12px', fontSize: 13 }}
                      value={u.planId || 1}
                      disabled={assigningUserId === u.userId}
                      onChange={(e) => handleAssignPlan(u.userId, parseInt(e.target.value))}
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {userSubs.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
