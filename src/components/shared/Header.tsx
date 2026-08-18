'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notificationsApi, searchApi, workspacesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  type: string;
  subtitle?: string;
  color?: string;
  targetUrl: string;
}

export default function Header() {
  const pathname = usePathname();
  const { user, workspaceId, setWorkspaceId } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; isRead: boolean; createdAt: string }[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [workspaces, setWorkspaces] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (user) {
      workspacesApi.getAll()
        .then(res => setWorkspaces(res.data.data || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('theme-change'));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('theme-change'));
  };

  const pageTitle: Record<string, string> = {
    '/dashboard':            'Dashboard',
    '/projects':             'Projects',
    '/tasks':                'My Tasks',
    '/calendar':             'Calendar',
    '/members':              'Members',
    '/admin/roles':          'Roles & Permissions',
    '/admin/custom-fields':  'Custom Fields',
    '/admin/settings':       'Settings',
    '/admin/audit':          'Audit Logs',
    '/admin/plans':          'Plan Limits',
    '/admin/subscriptions':  'Account Subscriptions',
  };

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitle)) {
      if (pathname === path || pathname.startsWith(path + '/')) return title;
    }
    if (pathname.includes('/boards/')) return 'Board';
    return 'WorkManager';
  };

  useEffect(() => {
    notificationsApi.getUnreadCount()
      .then(res => setUnreadCount(res.data.data))
      .catch(() => {});
  }, []);

  const handleNotifClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      notificationsApi.getAll(false)
        .then(res => setNotifications(res.data.data))
        .catch(() => {});
    }
  };

  return (
    <header style={{
      height: 64, background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 20, position: 'sticky', top: 0, zIndex: 30,
    }}>
      {/* Page title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{getTitle()}</h2>
      </div>

      {/* Global search */}
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          style={{ width: 280, paddingLeft: 38, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          placeholder="Search tasks, projects..."
          value={searchQuery}
          onChange={async (e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val.trim().length > 1) {
              try {
                const res = await searchApi.query(val);
                setSearchResults(res.data.data || []);
                setShowSearchDropdown(true);
              } catch {
                setSearchResults([]);
              }
            } else {
              setSearchResults([]);
              setShowSearchDropdown(false);
            }
          }}
          onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
          onBlur={() => { setTimeout(() => setShowSearchDropdown(false), 200); }}
          id="global-search"
        />
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 320, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: '0 16px 36px rgba(0,0,0,0.5)', zIndex: 100,
            overflow: 'hidden',
            maxHeight: 280, overflowY: 'auto'
          }}>
            {searchResults.map(r => (
              <div key={`${r.type}-${r.id}`} style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input from losing focus immediately
                setShowSearchDropdown(false);
                setSearchQuery('');
                window.location.href = r.targetUrl;
              }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${r.color}22`, color: r.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0
                }}>
                  {r.type === 'project' ? '📁' : '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn-icon btn-ghost"
          onClick={handleNotifClick}
          style={{ position: 'relative', background: showNotifications ? 'var(--bg-hover)' : 'transparent', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--text-secondary)' }}
          id="notification-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--danger)', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 360, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 14,
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', zIndex: 100,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Notifications</span>
              <button onClick={() => {
                notificationsApi.markAllRead();
                setUnreadCount(0);
              }} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Mark all read
              </button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 24, marginBottom: 8 }}>🔔</p>
                  <p style={{ fontSize: 14 }}>No notifications</p>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)')}
                onClick={() => { notificationsApi.markRead(n.id); }}
                >
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{n.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="btn-icon btn-ghost"
        style={{ border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </button>

      {/* User Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
        boxShadow: '0 0 12px rgba(99,102,241,0.4)',
      }}>
        {user?.firstName?.[0]}{user?.lastName?.[0]}
      </div>
    </header>
  );
}
