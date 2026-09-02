'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { planApi } from '@/lib/api';

interface DbPlan {
  id: number;
  name: string;
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxBoardsPerProject: number;
  maxMembersPerWorkspace: number;
}

export default function LandingPage() {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'kanban' | 'calendar'>('kanban');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    planApi.getPublicPlans()
      .then(res => {
        if (res.data?.data) {
          setPlans(res.data.data);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      q: 'Is WorkManager free to get started?',
      a: 'Yes! You can choose our Free plan upon registration and start creating projects and boards right away.'
    },
    {
      q: 'How do notifications work in WorkManager?',
      a: 'WorkManager sends instant real-time in-app alerts when tasks are updated or assigned, plus automated email notifications for task reminders and team invitations.'
    },
    {
      q: 'What is included in subscription plans?',
      a: 'Each plan defines specific limits for maximum projects, team members, and boards per project. You can choose the plan that best fits your team.'
    },
    {
      q: 'How does Email OTP authentication work?',
      a: 'WorkManager supports passwordless login and 2-step registration using a 6-digit verification code sent directly to your email.'
    },
    {
      q: 'Can I upgrade my subscription plan anytime?',
      a: 'Yes! You can upgrade your plan anytime from your account settings to unlock higher project and member limits.'
    },
    {
      q: 'How do team permissions work?',
      a: 'You can invite team members to projects as Project Owners with full administrative access or as Project Members to manage tasks.'
    }
  ];

  const pillars = [
    { title: 'Kanban Boards', desc: 'Visual workflow management' },
    { title: 'Smart Calendar', desc: 'Task deadline tracking' },
    { title: 'Email & Live Alerts', desc: 'Real-time & email notifications' },
    { title: 'OTP Security', desc: 'Email verification code login' },
    { title: 'Plan Options', desc: 'Flexible subscription tiers' }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Dynamic Keyframe & Background Parallax Helper Styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(60px, -70px) rotate(180deg) scale(1.2); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(-70px, 60px) rotate(-180deg) scale(1.15); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0px, 0px) scale(0.9); }
          50% { transform: translate(50px, 50px) scale(1.18); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.8; }
          100% { transform: translateY(0px) scale(1); opacity: 0.3; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        .parallax-card {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease !important;
        }
        .parallax-card:hover {
          transform: translateY(-10px) scale(1.02) !important;
          box-shadow: 0 20px 40px var(--accent-glow) !important;
          border-color: var(--accent) !important;
        }
      `}</style>

      {/* ── Background Dot Grid Pattern Overlay ─────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(var(--border) 1.2px, transparent 1.2px)',
        backgroundSize: '36px 36px',
        opacity: 0.35,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* ── Layer 1: Multi-Speed Parallax Glowing Orbs ────────────────── */}
      {/* Orb 1 - Top Left Violet/Indigo Glow */}
      <div style={{
        position: 'absolute',
        top: -120,
        left: '2%',
        width: 650,
        height: 650,
        borderRadius: '50%',
        background: 'var(--accent-glow)',
        filter: 'blur(140px)',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * 0.4}px)`,
        animation: 'floatOrb1 11s ease-in-out infinite, pulseGlow 7s ease-in-out infinite'
      }} />

      {/* Orb 2 - Middle Right Cyan/Blue Glow */}
      <div style={{
        position: 'absolute',
        top: 500,
        right: '1%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'rgba(6, 182, 212, 0.28)',
        filter: 'blur(130px)',
        opacity: 0.55,
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * -0.3}px)`,
        animation: 'floatOrb2 14s ease-in-out infinite, pulseGlow 9s ease-in-out infinite'
      }} />

      {/* Orb 3 - Center Pink/Purple Glow */}
      <div style={{
        position: 'absolute',
        top: 1300,
        left: '15%',
        width: 550,
        height: 550,
        borderRadius: '50%',
        background: 'rgba(236, 72, 153, 0.22)',
        filter: 'blur(135px)',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * 0.2}px)`,
        animation: 'floatOrb3 16s ease-in-out infinite'
      }} />

      {/* Orb 4 - Lower Right Deep Indigo Glow */}
      <div style={{
        position: 'absolute',
        top: 2100,
        right: '10%',
        width: 580,
        height: 580,
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.25)',
        filter: 'blur(140px)',
        opacity: 0.5,
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * -0.15}px)`,
        animation: 'floatOrb1 18s ease-in-out infinite'
      }} />

      {/* ── Layer 2: Floating Animated Ambient Dust Particles ──────────── */}
      <div style={{
        position: 'absolute',
        top: 250,
        left: '20%',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: 'var(--accent)',
        filter: 'blur(2px)',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * 0.15}px)`,
        animation: 'floatParticle 6s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        top: 450,
        right: '25%',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#ec4899',
        filter: 'blur(3px)',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * -0.2}px)`,
        animation: 'floatParticle 8s ease-in-out infinite 1s'
      }} />

      <div style={{
        position: 'absolute',
        top: 900,
        left: '12%',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: '#06b6d4',
        filter: 'blur(2px)',
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translateY(${scrollY * 0.1}px)`,
        animation: 'floatParticle 7s ease-in-out infinite 2s'
      }} />

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <nav className="glass" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '18px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <div>
            <span className="text-gradient" style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}>
              WorkManager
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
          <a href="#views" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Interactive Views</a>
          <a href="#collaboration" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Permissions</a>
          <a href="#pricing" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing</a>
          <a href="#faq" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary" style={{
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{
                fontSize: 15,
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: 8,
                textDecoration: 'none'
              }}>
                Sign In
              </Link>
              <Link href="/plans" className="btn btn-primary" style={{
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section with Parallax Movement ─────────────────────── */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '90px 32px 60px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        transform: `translateY(${Math.min(scrollY * 0.1, 50)}px)`,
        transition: 'transform 0.08s ease-out'
      }}>

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
          marginBottom: 28,
          transform: `translateY(${Math.min(scrollY * 0.05, 20)}px)`
        }}>
          <span>✨ Modern Project & Task Management Platform</span>
        </div>

        <h1 style={{
          fontSize: 58,
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-2px',
          marginBottom: 24,
          color: 'var(--text-primary)',
          transform: `translateY(${Math.min(scrollY * 0.04, 15)}px)`
        }}>
          Manage Tasks & Projects with <br/>
          <span className="text-gradient">Complete Control & Visual Flow</span>
        </h1>

        <p style={{
          fontSize: 19,
          color: 'var(--text-secondary)',
          maxWidth: 780,
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          WorkManager brings Kanban board tracking, due date calendar scheduling, real-time in-app notifications, and email alerts into one clean platform.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 50 }}>
          <Link href="/plans" className="btn btn-primary" style={{
            padding: '16px 36px',
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Get Started for Free
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

        {/* ── Core Platform Pillars Bar ─────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginBottom: 60,
          padding: '24px 32px',
          background: 'var(--bg-secondary)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)'
        }}>
          {pillars.map((pil, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {pil.title}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                {pil.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 3D Parallax Tilt Product Mock Container */}
        <div className="card parallax-card" style={{
          padding: 24,
          borderRadius: 20,
          transform: `perspective(1200px) rotateX(${Math.min(scrollY * 0.03, 10)}deg) scale(${Math.max(1 - scrollY * 0.0002, 0.94)})`,
          transition: 'transform 0.1s ease-out, box-shadow 0.3s ease'
        }}>

          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 12,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }}/>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 12 }}>Kanban Board: Sprint Execution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                🔔 Real-Time Email & In-App Alerts
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'left' }}>
            {/* Column 1 */}
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>To Do</span>
                <span style={{ color: 'var(--text-muted)' }}>2</span>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Design System Component Review</div>
                <div style={{ fontSize: 12, color: 'var(--priority-high)', fontWeight: 600 }}>High Priority</div>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Update User Profile Info</div>
                <div style={{ fontSize: 12, color: 'var(--priority-medium)', fontWeight: 600 }}>Medium Priority</div>
              </div>
            </div>

            {/* Column 2 */}
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress</span>
                <span style={{ color: 'var(--text-muted)' }}>2</span>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email OTP Login Handler</div>
                <div style={{ fontSize: 12, color: 'var(--priority-critical)', fontWeight: 600 }}>Critical Priority</div>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Calendar Due Date Picker</div>
                <div style={{ fontSize: 12, color: 'var(--priority-low)', fontWeight: 600 }}>Low Priority</div>
              </div>
            </div>

            {/* Column 3 */}
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Done</span>
                <span style={{ color: 'var(--text-muted)' }}>2</span>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Subscription Plan Selection</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Done</div>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Global Input Character Limits</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Done</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Section ──────────────────────────────── */}
      <section id="features" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Platform Features
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>
            Built for Clear Task Execution
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 640, margin: '0 auto' }}>
            WorkManager helps team members collaborate smoothly with visual boards, scheduled due dates, and secure authentication.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32
        }}>
          {/* Feature 1 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px var(--accent-glow)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Kanban Workflow Boards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Organize tasks into status columns (Backlog, To Do, In Progress, Review, Done). Update task statuses easily across columns.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-secondary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px rgba(6, 182, 212, 0.35)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Monthly Calendar Schedule</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Keep deadlines visible. View upcoming task due dates across active projects in a clean monthly calendar layout.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px rgba(244, 63, 94, 0.35)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Team Collaboration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Invite teammates to projects by email to make contributions and manage tasks together in real time.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px var(--accent-glow)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Task Priority Badges</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Categorize task urgency with Low, Medium, High, and Critical priority levels for quick visual sorting.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-secondary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px rgba(6, 182, 212, 0.35)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Email OTP Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Sign in securely using password authentication or instant 6-digit verification codes sent directly to your email.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card parallax-card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'var(--gradient-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 6px 16px rgba(244, 63, 94, 0.35)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Task Details Drawer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
              Open side drawers to manage task descriptions, priority levels, checklists, file attachments, time logs, and comments.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive View Showcase Section ───────────────────────────── */}
      <section id="views" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Interactive View Showcase
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>
              Multiple Views for Project Management
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 17, maxWidth: 640, margin: '0 auto' }}>
              Switch between Kanban workflow columns and monthly calendar deadlines.
            </p>
          </div>

          {/* Tab Selection Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36 }}>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`btn ${activeTab === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700 }}
            >
              📋 Kanban View
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700 }}
            >
              📅 Calendar Schedule
            </button>
          </div>

          {/* Tab Content 1: Kanban */}
          {activeTab === 'kanban' && (
            <div className="card" style={{ padding: 36, borderRadius: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Kanban Task Workflow</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    Group task cards into customizable status columns. Assign priorities and set due dates to keep progress clear for everyone.
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 0 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Priority tags: Low, Medium, High, Critical
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Quick card status updates
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Detailed drawer for description & sub-tasks
                    </li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 14, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>Task Card Drawer</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Integrate Email Notification Service</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                    Connect backend service to send verification codes and task assignment notification emails.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--priority-critical)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      Critical Priority
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Due: Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Calendar */}
          {activeTab === 'calendar' && (
            <div className="card" style={{ padding: 36, borderRadius: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Smart Deadline Calendar</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    Track scheduled due dates in a clean monthly calendar layout. Click any date pill to inspect task details.
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 0 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Color-coded task pills on scheduled dates
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Direct click to open task detail modal
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> Month navigation controls
                    </li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Monthly Schedule</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Calendar View</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 12 }}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(day => (
                      <div key={day} style={{
                        padding: '10px 4px',
                        background: day === 2 ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                        border: day === 2 ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: 8,
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: day === 2 ? 800 : 500
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Detail Breakdown Section 2: Collaboration ───────────────── */}
      <section id="collaboration" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '90px 32px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="card" style={{ padding: 36, borderRadius: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Project Roles & Permissions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Project Owner</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full admin capabilities & board management</div>
                </div>
                <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Owner</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Project Member</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Task creation, editing & status updates</div>
                </div>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Member</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Clear Access Controls
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 20 }}>
              Collaborate with Proper Access
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              Invite teammates to projects by email address. Keep project settings secure while giving members the ability to create and update tasks.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing & Plans Section ──────────────────────────────── */}
      <section id="pricing" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '90px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Subscription Plans
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>
            Plans Built for Your Team Size
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 640, margin: '0 auto' }}>
            Choose a plan that fits your project and team requirements.
          </p>
        </div>

        {plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading pricing plans...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: 32, alignItems: 'stretch' }}>
            {plans.map((plan, idx) => {
              const isMiddle = idx === 1;
              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    padding: 36,
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
                      boxShadow: '0 4px 12px var(--accent-glow)'
                    }}>
                      POPULAR
                    </span>
                  )}

                  <div>
                    <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{plan.name} Plan</h3>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 24 }}>Plan Option #{plan.id}</div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, margin: '0 0 32px 0' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {plan.maxProjectsPerWorkspace === 0 ? 'Unlimited Projects' : `Up to ${plan.maxProjectsPerWorkspace} Projects`}
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {plan.maxMembersPerWorkspace === 0 ? 'Unlimited Members' : `Up to ${plan.maxMembersPerWorkspace} Members`}
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span> {plan.maxBoardsPerProject === 0 ? 'Unlimited Boards' : `Up to ${plan.maxBoardsPerProject} Boards per Project`}
                      </li>
                    </ul>
                  </div>

                  <Link
                    href={`/register?planId=${plan.id}`}
                    className={isMiddle ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    Select {plan.name} →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────── */}
      <section id="faq" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Questions & Answers
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Learn more about how WorkManager operates.</p>
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

      {/* ── Final Call To Action ───────────────────────────────────── */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '100px 32px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 28,
          padding: '70px 32px',
          color: '#ffffff',
          boxShadow: '0 20px 50px var(--accent-glow)'
        }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
            Ready to Organize Your Work?
          </h2>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Join WorkManager today and start managing your projects with clarity.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link href="/plans" className="btn" style={{
              padding: '16px 36px',
              borderRadius: 12,
              background: '#ffffff',
              color: 'var(--accent-hover)',
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
            }}>
              Get Started Free
            </Link>
            <Link href="/login" className="btn" style={{
              padding: '16px 36px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        padding: '60px 48px 30px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40, textAlign: 'left' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'var(--gradient-primary)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </div>
              <span className="text-gradient" style={{ fontSize: 18, fontWeight: 800 }}>WorkManager</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 320 }}>
              The modern project management platform designed to keep your team aligned, productive, and focused.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
              <a href="#views" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Interactive Views</a>
              <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing Plans</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign In</Link>
              <Link href="/plans" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Get Started</Link>
              <Link href="/forgot-password" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Forgot Password</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Security & Help</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a>
              <span style={{ color: 'var(--text-muted)' }}>Email & OTP Auth</span>
              <span style={{ color: 'var(--text-muted)' }}>Access Controls</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <p>© {new Date().getFullYear()} WorkManager. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
