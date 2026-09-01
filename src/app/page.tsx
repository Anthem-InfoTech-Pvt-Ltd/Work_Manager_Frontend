'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState<'kanban' | 'calendar' | 'time'>('kanban');

  const faqs = [
    {
      q: 'Is WorkManager free to use?',
      a: 'Yes! Our Free Starter plan allows individuals and small teams to create boards, track tasks, and collaborate without paying anything.'
    },
    {
      q: 'How many projects and boards can I create?',
      a: 'You can create unlimited projects and boards on Pro and Enterprise plans, and up to 3 active projects on the Free Starter plan.'
    },
    {
      q: 'Can I invite external team members and clients?',
      a: 'Yes, you can invite team members by email directly to specific projects or boards with custom role permissions (Admin, Editor, Viewer).'
    },
    {
      q: 'How does time tracking work in WorkManager?',
      a: 'Every task card includes built-in start/stop timers and manual log entry so your team can track actual hours spent versus estimated effort.'
    },
    {
      q: 'Is my project data secure?',
      a: 'Absolutely. All data is encrypted in transit and at rest using enterprise-grade SSL/TLS protocols and stored in isolated SQL databases.'
    },
    {
      q: 'Can I change my plan or cancel at any time?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time with no lock-in contracts or hidden cancellation fees.'
    }
  ];

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 3v18"/>
          <path d="M15 3v18"/>
        </svg>
      ),
      gradient: 'var(--gradient-primary)',
      title: 'Interactive Kanban Boards',
      desc: 'Drag & drop task cards across customizable status columns (To Do, In Progress, Review, Done). Set priorities, tags, and assignees.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="3"/>
          <path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
        </svg>
      ),
      gradient: 'var(--gradient-secondary)',
      title: 'Smart Calendar View',
      desc: 'Visualize deadlines across your month. Drag tasks to reschedule due dates instantly and prevent team bottlenecks.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      gradient: 'var(--gradient-accent)',
      title: 'Built-in Time Tracking',
      desc: 'Log hours worked directly inside task cards. View team productivity reports and track estimated vs actual hours.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      gradient: 'var(--gradient-primary)',
      title: 'Subtasks & Checklists',
      desc: 'Break large milestones into actionable step-by-step checklists. Track completion percentage live on board cards.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      gradient: 'var(--gradient-secondary)',
      title: 'Role-Based Access Control',
      desc: 'Assign Granular permissions. Grant workspace members Admin, Member, or Viewer rights to maintain data security.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      gradient: 'var(--gradient-accent)',
      title: 'Real-Time Activity & SignalR',
      desc: 'Receive live push updates whenever comments are posted, statuses change, or tasks are assigned to you.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Head of Product, TechScale',
      comment: 'WorkManager transformed our engineering sprint planning. The visual flow and instant SignalR updates keep everyone aligned.',
      avatar: 'SJ',
      color: '#6366f1'
    },
    {
      name: 'Marcus Chen',
      role: 'Operations Director, NexaLab',
      comment: 'The combination of Kanban cards and built-in time tracking solved our resource allocation headaches completely.',
      avatar: 'MC',
      color: '#06b6d4'
    },
    {
      name: 'Elena Rostova',
      role: 'Lead Designer, StudioVibe',
      comment: 'Sleek, intuitive, and fast. The dark mode and visual clarity make managing creative projects an absolute joy.',
      avatar: 'ER',
      color: '#ec4899'
    }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <nav className="glass" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            background: 'var(--gradient-primary)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--accent-glow)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="text-gradient" style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '-0.5px'
            }}>
              WorkManager
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              border: '1px solid var(--border)'
            }}>
              v2.0
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
          <a href="#demo" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Live Demo</a>
          <a href="#testimonials" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Reviews</a>
          <a href="#pricing" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary" style={{
              padding: '11px 22px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none'
            }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: 10,
                textDecoration: 'none'
              }}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{
                padding: '11px 22px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none'
              }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '100px 32px 70px',
        textAlign: 'center'
      }}>
        {/* Floating Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 22px',
          borderRadius: 30,
          background: 'var(--accent-glow)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)'
        }}>
          <span style={{ color: 'var(--accent)' }}>✨</span>
          <span>Next-Gen Work Management • Built for Modern Product Teams</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 64,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-2.5px',
          marginBottom: 28,
          color: 'var(--text-primary)'
        }}>
          Master Your Projects with <br/>
          <span className="text-gradient">Complete Clarity & Visual Flow</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 20,
          color: 'var(--text-secondary)',
          maxWidth: 820,
          margin: '0 auto 44px',
          lineHeight: 1.6
        }}>
          WorkManager unifies Kanban boards, smart calendar scheduling, subtask checklists, time tracking, and team collaboration into a single, beautifully responsive workspace.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 60 }}>
          <Link href="/register" className="btn btn-primary" style={{
            padding: '16px 36px',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 800,
            textDecoration: 'none'
          }}>
            Start Free Trial — No Credit Card
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{
            padding: '16px 36px',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Sign In to Account
          </Link>
        </div>

        {/* Hero Quick Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          maxWidth: 960,
          margin: '0 auto 70px',
          padding: '24px 32px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
        }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>50,000+</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Tasks Managed</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>99.9%</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Uptime Guarantee</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--info)' }}>10x</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Faster Delivery</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--warning)' }}>4.9 ★</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>User Rating</div>
          </div>
        </div>

        {/* ── Interactive Live Preview Mockup ────────────────────────────── */}
        <div id="demo" className="card" style={{
          padding: 24,
          borderRadius: 24,
          textAlign: 'left'
        }}>
          {/* Mock Window Header */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 14,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 12 }}>
                Project: Product Launch Q4 2026
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
              <button
                onClick={() => setActiveTab('kanban')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'kanban' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'kanban' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'calendar' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'calendar' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Calendar View
              </button>
              <button
                onClick={() => setActiveTab('time')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'time' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'time' ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Time Logs
              </button>
            </div>
          </div>

          {/* Tab Content 1: Kanban */}
          {activeTab === 'kanban' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {/* Column 1 */}
              <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📋 To Do</span>
                  <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>3</span>
                </div>
                <div className="card" style={{ padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Design System v2 Tokens</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Update dark mode variables and contrast tokens.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--priority-high)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                      High Priority
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>☑ 4/5 Checklists</span>
                  </div>
                </div>
                <div className="card" style={{ padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Setup Automated CI Pipeline</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Configure GitHub Actions for backend tests.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--priority-medium)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                      Medium Priority
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>⏱ 2h logged</span>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚡ In Progress</span>
                  <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: 12, color: 'var(--accent)' }}>2</span>
                </div>
                <div className="card" style={{ padding: 16, borderRadius: 12, marginBottom: 12, borderLeft: '4px solid var(--priority-critical)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>SignalR Real-Time Hub</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Broadcasting instant comment and task updates.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--priority-critical)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                      Critical Priority
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>In Review</span>
                  </div>
                </div>
                <div className="card" style={{ padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>JWT Auto-Expiration Refresh</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Validate 24h session tokens on initialization.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--priority-low)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                      Low Priority
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Due Tomorrow</span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div style={{ background: 'var(--bg-primary)', padding: 18, borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✅ Completed</span>
                  <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 10, fontSize: 12, color: 'var(--success)' }}>4</span>
                </div>
                <div className="card" style={{ padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Workspace Layer Removal</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Simplified navigation directly to Projects.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                      Completed
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓ Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Calendar */}
          {activeTab === 'calendar' && (
            <div style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>September 2026 Milestone Schedule</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, textAlign: 'center' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', paddingBottom: 8 }}>{day}</div>
                ))}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 8, border: '1px solid var(--border)', minHeight: 64, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Sep {i + 1}</div>
                    {i === 1 && <div style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: 2, borderRadius: 4, marginTop: 4 }}>JWT Fix</div>}
                    {i === 5 && <div style={{ fontSize: 10, background: 'var(--success)', color: '#fff', padding: 2, borderRadius: 4, marginTop: 4 }}>v2 Release</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 3: Time Logs */}
          {activeTab === 'time' && (
            <div style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Sprint Time Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Frontend UI Redesign</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Logged by Alex Morgan</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>4h 30m</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 14, background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Backend API Authorization</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Logged by Dev Team</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>6h 15m</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Feature Highlights Grid ─────────────────────────────────── */}
      <section id="features" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '90px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            Engineered for High-Performance Teams
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
            Everything You Need to Ship Projects Faster
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 680, margin: '0 auto' }}>
            WorkManager eliminates friction and provides complete visual control over every task, deadline, and team member.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32
        }}>
          {features.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: 36, borderRadius: 20 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: item.gradient,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 6px 18px var(--accent-glow)'
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof / Testimonials Section ──────────────────────── */}
      <section id="testimonials" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
              Loved by Product Teams
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
              What Teams Say About WorkManager
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>
              See how teams accelerate execution and maintain visual clarity every day.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: 36, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 28, fontStyle: 'italic' }}>
                  "{t.comment}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: t.color,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ────────────────────────────────────────── */}
      <section id="pricing" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '100px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            Flexible Pricing
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
            Simple Plans for Teams of All Sizes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 32 }}>
            Start for free and upgrade as your team grows.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
            padding: 6,
            borderRadius: 30,
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '10px 24px',
                borderRadius: 24,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
                background: billingCycle === 'monthly' ? 'var(--accent)' : 'transparent',
                color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '10px 24px',
                borderRadius: 24,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 14,
                background: billingCycle === 'annual' ? 'var(--accent)' : 'transparent',
                color: billingCycle === 'annual' ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              Annual Billing <span style={{ fontSize: 11, background: 'var(--success)', color: '#fff', padding: '2px 6px', borderRadius: 10, marginLeft: 6 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'stretch' }}>
          {/* Free Plan */}
          <div className="card" style={{ padding: 40, borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Free Starter</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Perfect for individuals & small side projects.</div>
              <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 24 }}>$0 <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>/ forever</span></div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, fontWeight: 600 }}>
                <li>✓ Up to 3 active projects</li>
                <li>✓ Unlimited Kanban task cards</li>
                <li>✓ Subtask checklists</li>
                <li>✓ Basic calendar view</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: 36, padding: '14px', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="card" style={{ padding: 40, borderRadius: 24, border: '2px solid var(--accent)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 12px 40px var(--accent-glow)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>Pro Team</span>
                <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12 }}>MOST POPULAR</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>For growing teams needing full power.</div>
              <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 24 }}>
                {billingCycle === 'annual' ? '$12' : '$15'} <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>/ user / mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, fontWeight: 600 }}>
                <li>✓ Unlimited projects & boards</li>
                <li>✓ Interactive calendar scheduling</li>
                <li>✓ Full time-tracking & logs</li>
                <li>✓ Granular role permissions</li>
                <li>✓ SignalR real-time updates</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-primary" style={{ marginTop: 36, padding: '14px', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="card" style={{ padding: 40, borderRadius: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Enterprise</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>For organizations requiring scale & security.</div>
              <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 24 }}>Custom</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 15, fontWeight: 600 }}>
                <li>✓ Everything in Pro Team</li>
                <li>✓ Dedicated customer manager</li>
                <li>✓ SLA uptime guarantee</li>
                <li>✓ Custom API integrations</li>
                <li>✓ Audit logs & SAML SSO</li>
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary" style={{ marginTop: 36, padding: '14px', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive FAQ Section ─────────────────────────────────── */}
      <section id="faq" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
              Have Questions?
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
              Everything you need to know about WorkManager sessions, features, and plans.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                >
                  <div style={{
                    padding: '22px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    userSelect: 'none'
                  }}>
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                      color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                      transition: 'color 0.2s ease'
                    }}>
                      {faq.q}
                    </h3>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isOpen ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      color: isOpen ? 'var(--accent)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.3s ease, background 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{
                      padding: '0 28px 22px 28px',
                      color: 'var(--text-secondary)',
                      fontSize: 15,
                      lineHeight: 1.7,
                      animation: 'fadeIn 0.25s ease-out',
                      borderTop: '1px solid var(--border)',
                      paddingTop: 16,
                      marginTop: 0
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA Banner ──────────────────────────────────────── */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '100px 32px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 28,
          padding: '80px 40px',
          color: '#ffffff',
          boxShadow: '0 20px 60px var(--accent-glow)'
        }}>
          <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1px', marginBottom: 18 }}>
            Ready to Transform How Your Team Works?
          </h2>
          <p style={{ fontSize: 19, opacity: 0.95, maxWidth: 640, margin: '0 auto 38px', lineHeight: 1.6 }}>
            Join thousands of teams delivering projects on time with total visual clarity and zero stress.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Link href="/register" className="btn" style={{
              padding: '16px 38px',
              borderRadius: 12,
              background: '#ffffff',
              color: '#4f46e5',
              fontWeight: 900,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
            }}>
              Get Started Free Now
            </Link>
            <Link href="/login" className="btn" style={{
              padding: '16px 38px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none'
            }}>
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '60px 48px 40px',
        background: 'var(--bg-secondary)',
        fontSize: 14,
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>WM</div>
              <span className="text-gradient" style={{ fontSize: 20, fontWeight: 900 }}>WorkManager</span>
            </div>
            <p style={{ maxWidth: 320, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Next-generation project management platform for modern teams. Organize work, track time, and deliver faster.
            </p>
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', fontWeight: 700, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}/>
              All Systems Operational
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Product</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Kanban Boards</a></li>
              <li><a href="#demo" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Calendar View</a></li>
              <li><a href="#demo" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Time Tracking</a></li>
              <li><a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Resources</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Help & FAQ</a></li>
              <li><Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</Link></li>
              <li><Link href="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Register</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Legal</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><span style={{ color: 'var(--text-muted)' }}>Privacy Policy</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Terms of Service</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Security</span></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} WorkManager Inc. All rights reserved. Designed for visual team clarity.
        </div>
      </footer>

    </div>
  );
}
