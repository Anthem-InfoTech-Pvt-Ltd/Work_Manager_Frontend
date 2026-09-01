'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { planApi } from '@/lib/api';

interface DbPlan {
  id: number;
  name: string;
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxBoardsPerProject: number;
  maxMembersPerWorkspace: number;
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planApi.getPublicPlans()
      .then(res => {
        if (res.data?.data) {
          setPlans(res.data.data);
        }
      })
      .catch(() => {
        // Failed to load plans
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatLimit = (val: number, singular: string, plural: string) => {
    if (val === 0) return `Unlimited ${plural}`;
    return `Up to ${val} ${val === 1 ? singular : plural}`;
  };

  const handleSelectPlan = (planId: number) => {
    router.push(`/register?planId=${planId}`);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navigation Header */}
      <nav className="glass" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '18px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 44,
            height: 44,
            background: 'var(--gradient-primary)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--accent-glow)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <span className="text-gradient" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
            WorkManager
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Already have an account?</span>
          <Link href="/login" className="btn btn-secondary" style={{
            fontSize: 14,
            fontWeight: 600,
            padding: '10px 18px',
            borderRadius: 8,
            textDecoration: 'none'
          }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px 100px', textAlign: 'center' }}>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 24,
          background: 'var(--accent-glow)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 24
        }}>
          <span>🚀 Live Database Plans • Step 1 of 2</span>
        </div>

        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
          Select Your Plan
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 50px', lineHeight: 1.6 }}>
          Plans and limits are fetched directly from our database. Select a plan to proceed with registration.
        </p>

        {loading ? (
          <div style={{ padding: '60px', fontSize: 16, color: 'var(--text-secondary)' }}>Loading plans from database...</div>
        ) : plans.length === 0 ? (
          <div style={{ padding: '60px', fontSize: 16, color: 'var(--text-muted)' }}>No plans found in database.</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`,
            gap: 32,
            textAlign: 'left',
            alignItems: 'stretch'
          }}>
            {plans.map((plan, index) => {
              const isMiddle = index === 1;
              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    padding: 40,
                    borderRadius: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    border: isMiddle ? '2px solid var(--accent)' : '1px solid var(--border)',
                    boxShadow: isMiddle ? '0 12px 40px var(--accent-glow)' : '0 4px 20px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {isMiddle && (
                    <span style={{
                      position: 'absolute',
                      top: -14,
                      right: 24,
                      background: 'var(--gradient-primary)',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: 20,
                      letterSpacing: 0.5,
                      boxShadow: '0 4px 12px var(--accent-glow)'
                    }}>
                      RECOMMENDED
                    </span>
                  )}

                  <div>
                    <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                    
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 28 }}>
                      Plan #{plan.id}
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: '0 0 32px 0' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {formatLimit(plan.maxProjectsPerWorkspace, 'Project', 'Projects')}
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {formatLimit(plan.maxMembersPerWorkspace, 'Member', 'Members')}
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={isMiddle ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Select {plan.name} →
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
