'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, projectsApi, boardsApi, tasksApi, activitiesApi, dashboardApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateIndian, formatActivityText } from '@/lib/format';
import { getCachedData, setCachedData } from '@/lib/cache';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ProjectItem {
  id: number;
  name: string;
}

interface ProjectTaskSummary {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  boardId: number;
  projectId: number;
  projectName: string;
  assigneeName?: string;
}

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  completedToday: number;
  inProgressTasks: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasks: ProjectTaskSummary[];
  recentActivities: { id: number; userName: string; taskId?: number; boardId?: number; taskTitle?: string; type: string; data?: string; createdAt: string }[];
}

const statCards = [
  { key: 'totalProjects', label: 'Total Projects', icon: '📁', color: '#6366f1', href: '/projects' },
  { key: 'totalTasks',    label: 'Total Tasks',    icon: '✅', color: '#22c55e', href: '#project-tasks-overview' },
  { key: 'overdueTasks',  label: 'Overdue Tasks',  icon: '⚠️', color: '#ef4444', href: '#project-tasks-overview' },
  { key: 'completedToday',label: 'Done Today',     icon: '🎯', color: '#f59e0b', href: '#project-tasks-overview' },
];

const statusColors: Record<string, string> = {
  todo: '#6366f1', to_do: '#6366f1', in_progress: '#f59e0b', review: '#8b5cf6',
  testing: '#06b6d4', done: '#10b981', completed: '#10b981', backlog: '#6b7280', cancelled: '#ec4899',
};
const priorityColors: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981',
};

const statusBadgeStyles: Record<string, { bg: string; color: string }> = {
  todo: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  in_progress: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  review: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
  testing: { bg: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' },
  done: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
  backlog: { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
};

const priorityBadgeStyles: Record<string, { bg: string; color: string }> = {
  critical: { bg: 'rgba(220, 38, 38, 0.15)', color: '#dc2626' },
  high: { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
  medium: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
};

export default function DashboardPage() {
  const { user, workspaceId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Load accessible projects list
  useEffect(() => {
    const fetchProjectsList = async () => {
      try {
        const isSuperAdmin = user?.roles?.includes('Super Admin');
        if (isSuperAdmin) {
          const res = await adminApi.getPlatformSummary();
          setProjects(res.data.data?.projects ?? []);
        } else {
          const res = await projectsApi.getAll();
          setProjects(res.data.data ?? []);
        }
      } catch (e) {
        console.error('Failed to fetch projects list', e);
      }
    };
    fetchProjectsList();
  }, [user?.id, workspaceId]);

  // Load Dashboard Stats based on selected project
  useEffect(() => {
    const pIdParam = selectedProjectId === 'all' ? undefined : selectedProjectId;
    const cacheKey = `dashboard_stats_${user?.id}_${selectedProjectId}`;
    const cachedStats = getCachedData<DashboardStats>(cacheKey, 60000);

    if (cachedStats) {
      setStats(cachedStats);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchStats = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          dashboardApi.getStats(pIdParam),
          activitiesApi.getRecent(10, pIdParam).catch(() => ({ data: { data: [] } }))
        ]);

        const s = statsRes.data.data;
        const recentActivities = activitiesRes.data.data || [];

        const newStats: DashboardStats = {
          totalProjects: s.totalProjects,
          totalTasks: s.totalTasks,
          overdueTasks: s.overdueTasks,
          completedToday: s.completedTasks,
          inProgressTasks: s.inProgressTasks,
          tasksByStatus: s.tasksByStatus || [],
          tasksByPriority: s.tasksByPriority || [],
          tasks: s.tasks || [],
          recentActivities
        };

        setStats(newStats);
        setCachedData(cacheKey, newStats);
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [workspaceId, user?.id, selectedProjectId]);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setThemeMode(isDark ? 'dark' : 'light');
    };
    checkTheme();
    window.addEventListener('theme-change', checkTheme);
    return () => window.removeEventListener('theme-change', checkTheme);
  }, []);

  const statusChartData = stats ? {
    labels: stats.tasksByStatus.map(s => s.status.replace('_', ' ').toUpperCase()),
    datasets: [{
      data: stats.tasksByStatus.map(s => s.count),
      backgroundColor: stats.tasksByStatus.map(s => statusColors[s.status] ?? '#6b7280'),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : null;

  const priorityChartData = stats ? {
    labels: stats.tasksByPriority.map(p => p.priority.toUpperCase()),
    datasets: [{
      label: 'Tasks',
      data: stats.tasksByPriority.map(p => p.count),
      backgroundColor: stats.tasksByPriority.map(p => priorityColors[p.priority] ?? '#6b7280'),
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: themeMode === 'dark' ? '#c4b5fd' : '#4c4f69', font: { size: 12, weight: 600 as const } } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { 
        ticks: { color: themeMode === 'dark' ? '#c4b5fd' : '#4c4f69' }, 
        grid: { color: themeMode === 'dark' ? '#373168' : '#c7d2fe' } 
      },
      y: { 
        ticks: { color: themeMode === 'dark' ? '#c4b5fd' : '#4c4f69' }, 
        grid: { color: themeMode === 'dark' ? '#373168' : '#c7d2fe' } 
      },
    },
  };

  const selectedProjectName = selectedProjectId === 'all' 
    ? 'All Projects' 
    : projects.find(p => p.id === selectedProjectId)?.name || 'Selected Project';

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header & Project Switcher */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Good day, {user?.firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Here's an overview of your projects and active tasks today.
          </p>
        </div>

        {/* Project Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Project:</span>
          <select
            className="input"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ padding: '6px 12px', fontSize: 14, fontWeight: 600, width: 'auto', minWidth: 160, cursor: 'pointer', borderRadius: 8 }}
            id="project-switcher-select"
          >
            <option value="all">📂 All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                📁 {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ key, label, icon, color, href }) => (
          <Link
            key={key}
            href={href}
            className="stat-card fade-in"
            style={{
              '--accent': color,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            } as React.CSSProperties}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>{label}</p>
              {loading ? (
                <div className="skeleton" style={{ height: 36, width: 80 }} />
              ) : (
                <p style={{ fontSize: 36, fontWeight: 700, color }}>{(stats as unknown as Record<string, number>)?.[key] ?? 0}</p>
              )}
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            Tasks by Status {selectedProjectId !== 'all' && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>({selectedProjectName})</span>}
          </h3>
          {loading ? <div className="skeleton" style={{ height: 280 }} /> : (
            statusChartData && statusChartData.labels.length > 0 ? (
              <div style={{ height: 280, width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={statusChartData} options={{ ...chartOptions, cutout: '65%' }} />
              </div>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No status data for this selection
              </div>
            )
          )}
        </div>

        <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            Tasks by Priority {selectedProjectId !== 'all' && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>({selectedProjectName})</span>}
          </h3>
          {loading ? <div className="skeleton" style={{ height: 280 }} /> : (
            priorityChartData && priorityChartData.labels.length > 0 ? (
              <div style={{ height: 280, width: '100%', position: 'relative' }}>
                <Bar data={priorityChartData} options={barOptions} />
              </div>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No priority data for this selection
              </div>
            )
          )}
        </div>
      </div>

      {/* Project Tasks Overview Section (Only shown when a specific project is selected) */}
      {selectedProjectId !== 'all' && (
        <div id="project-tasks-overview" className="card" style={{ padding: 28, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>
              Project Tasks Overview <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>({selectedProjectName})</span>
            </h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Showing {stats?.tasks.length ?? 0} task{(stats?.tasks.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
            </div>
          ) : !stats?.tasks || stats.tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>📝</p>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No tasks found</p>
              <p style={{ fontSize: 13 }}>There are no active tasks in {selectedProjectName}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Task Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Project</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assignee</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.tasks.map(t => {
                    return (
                      <tr 
                        key={t.id} 
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                          <Link 
                            href={`/boards/${t.boardId}?task=${t.id}`}
                            style={{ color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          >
                            {t.title}
                          </Link>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          <Link
                            href={`/boards/${t.boardId}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                          >
                            📁 {t.projectName}
                          </Link>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge badge-status-${t.status}`}>
                            {(t.status || 'todo').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge badge-priority-${t.priority}`}>
                            {t.priority || 'medium'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {t.assigneeName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)',
                                color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                              }}>
                                {t.assigneeName[0].toUpperCase()}
                              </div>
                              <span>{t.assigneeName}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 13 }}>
                          {t.dueDate ? formatDateIndian(t.dueDate) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
          Recent Activity {selectedProjectId !== 'all' && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>({selectedProjectName})</span>}
        </h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : stats?.recentActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
            <p>No recent activity</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stats?.recentActivities.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 12px', borderRadius: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {(a.userName ?? 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>{a.userName}</span>
                    {' '}
                    {a.boardId && a.taskId ? (
                      <Link 
                        href={`/boards/${a.boardId}?task=${a.taskId}`}
                        style={{ color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      >
                        {formatActivityText(a.type, a.data, a.taskTitle)}
                      </Link>
                    ) : (
                      formatActivityText(a.type, a.data, a.taskTitle)
                    )}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDateIndian(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
