'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LandingPage() {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is WorkManager free to use?',
      a: 'Yes! You can create a free account and start managing projects immediately.'
    },
    {
      q: 'How many projects and boards can I create?',
      a: 'You can create multiple projects and boards to organize your workload efficiently.'
    },
    {
      q: 'Can I invite external team members?',
      a: 'Yes, you can invite team members by email directly to specific projects or boards with custom permissions.'
    },
    {
      q: 'How secure is my project data?',
      a: 'Your data is protected with industry-standard encryption, secure authentication, and strict access controls.'
    }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
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
          <a href="#views" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Views</a>
          <a href="#collaboration" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>Collaboration</a>
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

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '110px 32px 80px',
        textAlign: 'center'
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
          marginBottom: 28
        }}>
          <span>✨ Everything your team needs to plan, track & deliver</span>
        </div>

        <h1 style={{
          fontSize: 60,
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-2px',
          marginBottom: 28,
          color: 'var(--text-primary)'
        }}>
          Organize Your Projects with <br/>
          <span className="text-gradient">Complete Clarity & Visual Flow</span>
        </h1>

        <p style={{
          fontSize: 20,
          color: 'var(--text-secondary)',
          maxWidth: 780,
          margin: '0 auto 42px',
          lineHeight: 1.6
        }}>
          WorkManager combines Kanban boards, interactive task details, and calendar scheduling into a single powerful platform built for high-performing teams.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 70 }}>
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

        {/* Product Visual Mock Container */}
        <div className="card" style={{
          padding: 24,
          borderRadius: 20
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 12,
            padding: '20px 24px',
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
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 12 }}>Project: Product Roadmap 2026</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Live Preview</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'left' }}>
            {/* Column 1 */}
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>To Do</span>
                <span style={{ color: 'var(--text-muted)' }}>3</span>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Design System Updates</div>
                <div style={{ fontSize: 12, color: 'var(--priority-high)', fontWeight: 600 }}>High Priority</div>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>User Onboarding Flow</div>
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
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>API Optimization & Caching</div>
                <div style={{ fontSize: 12, color: 'var(--priority-critical)', fontWeight: 600 }}>Critical Priority</div>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Calendar View Redesign</div>
                <div style={{ fontSize: 12, color: 'var(--priority-low)', fontWeight: 600 }}>Low Priority</div>
              </div>
            </div>

            {/* Column 3 */}
            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed</span>
                <span style={{ color: 'var(--text-muted)' }}>4</span>
              </div>
              <div className="card" style={{ padding: 14, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Remove Workspace Layer</div>
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
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>
            Designed to Streamline Team Execution
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 640, margin: '0 auto' }}>
            WorkManager provides clear structure without clutter, giving your team full visibility into project progress.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32
        }}>
          {/* Feature 1 */}
          <div className="card" style={{ padding: 40, borderRadius: 20 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 6px 16px var(--accent-glow)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
                <path d="M15 3v18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Interactive Kanban Boards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
              Create custom workflow columns (Backlog, To Do, In Progress, Review, Testing, Done). Move cards effortlessly and track status updates instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ padding: 40, borderRadius: 20 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'var(--gradient-secondary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 6px 16px rgba(6, 182, 212, 0.35)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Smart Calendar View</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
              Never miss a deadline. View task due dates across all active projects on an interactive, color-coded monthly calendar.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ padding: 40, borderRadius: 20 }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'var(--gradient-accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              boxShadow: '0 6px 16px rgba(244, 63, 94, 0.35)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Team Access & Permissions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
              Invite teammates directly to projects and boards. Control member capabilities such as task creation, board management, and member administration.
            </p>
          </div>
        </div>
      </section>

      {/* ── Detail Breakdown Section 1: Kanban & Views ────────────────── */}
      <section id="views" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Visual Workflow Engine
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 20 }}>
              Keep Tasks Moving from Ideation to Production
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              Break complex projects into manageable task cards. Assign task priorities (Low, Medium, High, Critical), set due dates, add detailed descriptions, and leave comments in real time.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600 }}>
                <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span> Priority-based color coding for critical tasks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600 }}>
                <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span> Task assignee avatars and quick filters
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600 }}>
                <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span> Instant drag-and-drop column positioning
              </li>
            </ul>
          </div>

          <div className="card" style={{ padding: 32, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Task Details Card</div>
            <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Setup Production Monitoring</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Configure health checks and automated email alerts for backend service uptime.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--priority-critical)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  Critical Priority
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Due: Oct 28</span>
              </div>
            </div>
          </div>
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
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Project Members & Permissions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Alex Morgan</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Project Owner</div>
                </div>
                <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Full Access</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Dev Team</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Project Member</div>
                </div>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Can Edit Tasks</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Seamless Teamwork
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 20 }}>
              Collaborate Without Friction
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              Send direct email invitations to team members. Maintain granular access controls so everyone knows exactly what they are responsible for.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────── */}
      <section id="faq" style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '90px 32px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Everything you need to know about WorkManager.</p>
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
            Join WorkManager today and start managing your projects with clarity and speed.
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
        padding: '40px 32px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14
      }}>
        <p>© {new Date().getFullYear()} WorkManager. All rights reserved.</p>
      </footer>

    </div>
  );
}
