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
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
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
                borderRadius: 6
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
          <span>🚀 High-Performance Project & Team Collaboration</span>
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
        padding: '40px 24px 90px'
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24
        }}>
          {/* Feature 1: Interactive Kanban Boards */}
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
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
              Organize tasks across custom stages like To Do, In Progress, Review, Testing, and Done. Move cards seamlessly as work progresses.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
              <li>Customizable board lists & workflow columns</li>
              <li>Drag-and-drop task organization</li>
              <li>Priority flags (Critical, High, Medium, Low)</li>
            </ul>
          </div>

          {/* Feature 2: Smart Calendar View */}
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
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
              Track project deadlines, upcoming deliverables, and team milestones across a clean monthly calendar interface.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
              <li>Unified view of task due dates across all projects</li>
              <li>Filter deadlines by priority and assigned project</li>
              <li>Instant task preview upon selecting any event</li>
            </ul>
          </div>

          {/* Feature 3: Team Collaboration & Permissions */}
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
                <path d="M23 21v-2a4 4 0 0 1 0 3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Team Collaboration & Invites</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
              Invite teammates directly to projects and boards with email notifications and custom role permissions.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
              <li>Send email invitations with 1-click registration links</li>
              <li>Granular permissions (Manage Members, Delete Tasks)</li>
              <li>Assign tasks to team members with real-time updates</li>
            </ul>
          </div>

          {/* Feature 4: Admin Platform Control */}
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
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Admin & Platform Control</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
              Super Admins gain full platform visibility over projects, users, subscriptions, and system-wide settings.
            </p>
            <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
              <li>Manage all user roles and permissions</li>
              <li>Platform summary and quota management</li>
              <li>Archived items management & retrieval</li>
            </ul>
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
