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

  const navItems: NavItem[] = [
    { label: 'Dashboard',    href: '/dashboard',  icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
    { label: 'Calendar',     href: '/calendar',   icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { label: 'Projects',     href: '/projects',   icon: <Icon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /> },
  ];

  const adminItems: NavItem[] = [
    { label: 'Plan Limits', href: '/admin/plans', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
    { label: 'Platform Management', href: '/admin/platform', icon: <Icon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
    { label: 'System Error Logs', href: '/admin/error-logs', icon: <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" /> },
    { label: 'User Management', href: '/admin/users', icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 004-4 4 4 0 00-4-4 4 4 0 00-4 4 4 4 0 004 4zm7-7.83a8.87 8.87 0 014 4.83m0 6a8.87 8.87 0 01-4 4.83" /> },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const userRole = user?.roles?.[0] ?? 'Viewer';
  const isAdminOrSuper = userRole === 'Super Admin' || userRole === 'Admin';
  const isManager = userRole === 'Manager';

  // Filter Admin section based on user role
  const visibleAdminItems = adminItems.filter(item => {
    if (item.href === '/admin/platform') {
      return userRole === 'Super Admin';
    }
    if (item.href === '/admin/users') {
      return userRole === 'Super Admin';
    }
    if (item.href === '/admin/error-logs' || item.href === '/admin/plans' || item.href === '/admin/subscriptions') {
      return userRole === 'Super Admin';
    }
    if (isAdminOrSuper) return true;
    if (isManager && (item.href === '/admin/automations')) return true;
    return false;
  });

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        color: isActive(item.href) ? '#fff' : 'var(--text-secondary)',
        background: isActive(item.href) ? 'var(--gradient-primary)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: isActive(item.href) ? '0 4px 16px rgba(168, 85, 247, 0.4)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!isActive(item.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.badge && (
        <span style={{
          marginLeft: 'auto', background: 'var(--gradient-accent)', color: '#fff',
          borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)',
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
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(168, 85, 247, 0.45)', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-gradient" style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>WorkManager</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Enterprise Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 12px', marginBottom: 8 }}>
            Main
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => <NavLink key={item.href} item={item} />)}
          </div>
        </div>

        {visibleAdminItems.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 12px', marginBottom: 8 }}>
              Admin
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {visibleAdminItems.map(item => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        )}
      </div>

      {/* User profile & Logout */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 10px', borderRadius: 12,
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
              boxShadow: '0 2px 12px rgba(168, 85, 247, 0.4)',
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName}
              </p>
              {userRole === 'Super Admin' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                    background: 'var(--gradient-primary)', color: '#fff', textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
                  }}>
                    {userRole}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Logout"
          id="sidebar-logout-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
