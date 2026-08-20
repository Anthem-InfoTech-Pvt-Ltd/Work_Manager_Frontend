'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.85)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>WorkManager</span>
          </div>
        </div>

        {/* Navigation Links & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user ? (
            <Link href="/dashboard" style={{
              padding: '10px 22px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'transform 0.2s'
            }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                transition: 'background 0.2s'
              }}>
                Sign In
              </Link>
              <Link href="/register" style={{
                padding: '10px 22px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
              }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '90px 24px 60px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 20,
          background: 'var(--accent-glow)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 24
        }}>
          <span>🚀 Fast, High-Performance Work Management Platform</span>
        </div>

        <h1 style={{
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: 24,
          color: 'var(--text-primary)'
        }}>
          Manage Projects & Teams with <br/>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Speed, Clarity and Precision</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          maxWidth: 720,
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          WorkManager empowers teams to plan projects, track tasks on interactive Kanban boards, schedule calendar deadlines, and collaborate seamlessly in real-time.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Link href="/register" style={{
            padding: '14px 32px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
          }}>
            Create Free Account
          </Link>
          <Link href="/login" style={{
            padding: '14px 32px',
            borderRadius: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none'
          }}>
            Sign In to Account
          </Link>
        </div>
      </section>

      {/* ── Feature Highlights Grid ─────────────────────────────────── */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '60px 24px 90px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Everything you need to deliver great work
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Designed for modern teams to stay organized, focused, and productive.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24
        }}>
          {/* Feature 1 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Interactive Kanban Boards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Organize tasks across custom stages (To Do, In Progress, Review, Done). Drag and move cards easily as work progresses.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Smart Calendar View</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Track project deadlines, upcoming deliverables, and milestones across a clean monthly calendar interface.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Team Collaboration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Invite team members directly to projects and boards with custom role permissions (Manage Tasks, Manage Members, Owner).
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 32
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>High Performance Backend</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Powered by optimized SQL Server stored procedures and client-side caching for fast page switches and zero latency.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14
      }}>
        <p>© {new Date().getFullYear()} WorkManager. All rights reserved.</p>
      </footer>

    </div>
  );
}
