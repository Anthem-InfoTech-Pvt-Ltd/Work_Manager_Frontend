'use client';

import Link from 'next/link';

interface AdminModule {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function AdminPage() {
  const modules: AdminModule[] = [
    { title: 'Roles & Permissions', description: 'Configure granular RBAC permissions, create roles, and assign capabilities.', href: '/admin/roles', icon: '🛡️', color: '#6366f1' },
    { title: 'Custom Fields', description: 'Create dynamic project fields (dropdowns, dates, values) without code changes.', href: '/admin/custom-fields', icon: '🔧', color: '#22c55e' },
    { title: 'System Settings', description: 'Configure application branding, default currencies, date formats, and time zones.', href: '/admin/settings', icon: '⚙️', color: '#ec4899' },
    { title: 'Audit Logs', description: 'View full organization compliance audit trails, user logins, and database operations.', href: '/admin/audit', icon: '📋', color: '#a78bfa' },
    { title: 'Archive & Trash Bin', description: 'Recover archived or deleted tasks, lists, boards, and projects, or permanently purge them.', href: '/admin/archive', icon: '🗑️', color: '#f87171' },
  ];

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1000, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Admin Control Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Configure organizational parameters, custom metadata schemas, user access levels, and security controls.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {modules.map((m, idx) => (
          <Link key={idx} href={m.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = m.color;
              e.currentTarget.style.boxShadow = `0 4px 20px ${m.color}11`;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${m.color}1a`,
                display: 'flex', alignItems: 'center', justifyItems: 'center',
                justifyContent: 'center', fontSize: 24,
                color: m.color,
                flexShrink: 0
              }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {m.description}
                </p>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
