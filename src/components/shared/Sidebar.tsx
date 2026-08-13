'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const Icon = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = user?.roles?.[0] ?? 'Admin';
  const isSuperAdmin = userRole === 'Super Admin';
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItems: NavItem[] = [
    { label: 'Dashboard',    href: '/dashboard',  icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
    { label: 'Projects',     href: '/projects',   icon: <Icon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /> },
    { label: 'Calendar',     href: '/calendar',   icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  ];

  if (isSuperAdmin) {
    navItems.push({
      label: 'Members',
      href: '/members',
      icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    });
    navItems.push({
      label: 'Admin',
      href: '/admin',
      icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    });
  }

  // Filter Admin section based on user role
  const visibleAdminItems: NavItem[] = [];

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 12px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        color: isActive(item.href) ? '#fff' : 'var(--text-secondary)',
        background: isActive(item.href) ? 'var(--accent)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
        position: 'relative',
        boxShadow: isActive(item.href) ? '0 0 16px var(--accent-glow)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.badge && (
        <span style={{
          marginLeft: 'auto', background: 'var(--danger)', color: '#fff',
          borderRadius: 20, padding: '2px 7px', fontSize: 11, fontWeight: 700,
        }}>
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>WorkManager</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enterprise Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', marginBottom: 6 }}>
            Main
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => <NavLink key={item.href} item={item} />)}
          </div>
        </div>

        {visibleAdminItems.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', marginBottom: 6 }}>
              Admin
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {visibleAdminItems.map(item => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        )}
      </div>

      {/* User profile */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', textTransform: 'uppercase'
                }}>
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        </Link>
        <button
          onClick={logout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 8, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          title="Sign out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
