'use client';

import { useEffect, useState } from 'react';
import { adminApi, projectsApi, boardsApi, tasksApi, activitiesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateIndian, formatActivityText } from '@/lib/format';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  completedToday: number;
  inProgressTasks: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recentActivities: { id: number; userName: string; type: string; data?: string; createdAt: string }[];
}

const statCards = [
  { key: 'totalProjects', label: 'Total Projects', icon: '📁', color: '#6366f1' },
  { key: 'totalTasks',    label: 'Total Tasks',    icon: '✅', color: '#22c55e' },
  { key: 'overdueTasks',  label: 'Overdue Tasks',  icon: '⚠️', color: '#ef4444' },
  { key: 'completedToday',label: 'Done Today',     icon: '🎯', color: '#f59e0b' },
];

const statusColors: Record<string, string> = {
  todo: '#3b82f6', in_progress: '#f59e0b', review: '#8b5cf6',
  testing: '#ec4899', done: '#22c55e', backlog: '#6b7280', cancelled: '#ef4444',
};
const priorityColors: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#22c55e',
};

export default function DashboardPage() {
  const { user, workspaceId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isSuperAdmin = user?.roles?.includes('Super Admin');
    if (!isSuperAdmin && !workspaceId) return;
    setLoading(true);

    const fetchStats = async () => {
      try {
        const [projectsRes, activitiesRes] = await Promise.all([
          isSuperAdmin ? adminApi.getPlatformSummary() : projectsApi.getAll(workspaceId!),
          activitiesApi.getRecent(10).catch(() => ({ data: { data: [] } }))
        ]);

        const projectsList = isSuperAdmin ? (projectsRes.data.data.projects || []) : (projectsRes.data.data || []);
        const globalBoardsList = isSuperAdmin ? (projectsRes.data.data.boards || []) : null;
        const recentActivities = activitiesRes.data.data || [];
        
        let totalTasks = 0;
        let overdueTasks = 0;
        let completedToday = 0;
        let inProgressTasks = 0;
        const statusMap: Record<string, number> = {};
        const priorityMap: Record<string, number> = {};

        const todayStr = new Date().toISOString().split('T')[0];

        for (const p of projectsList) {
          const boardsList = globalBoardsList
            ? globalBoardsList.filter((b: any) => b.projectId === p.id)
            : (await boardsApi.getByProject(p.id)).data.data || [];

          for (const b of boardsList) {
            const tasksRes = await tasksApi.getByBoard(b.id);
            const tasksList = tasksRes.data.data || [];
            for (const t of tasksList) {
              totalTasks++;

              const status = t.status || 'todo';
              statusMap[status] = (statusMap[status] || 0) + 1;
              if (status === 'in_progress') {
                inProgressTasks++;
              }
              if (status === 'done') {
                completedToday++;
              }

              const priority = t.priority || 'low';
              priorityMap[priority] = (priorityMap[priority] || 0) + 1;

              if (t.dueDate) {
                const dueDateStr = t.dueDate.split('T')[0];
                if (dueDateStr < todayStr && status !== 'done' && status !== 'cancelled') {
                  overdueTasks++;
                }
              }
            }
          }
        }

        const tasksByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
        const tasksByPriority = Object.entries(priorityMap).map(([priority, count]) => ({ priority, count }));

        setStats({
          totalProjects: projectsList.length,
          totalTasks,
          overdueTasks,
          completedToday,
          inProgressTasks,
          tasksByStatus,
          tasksByPriority,
          recentActivities
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, workspaceId]);

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
    plugins: {
      legend: { labels: { color: themeMode === 'dark' ? '#9898b8' : '#475569', font: { size: 12 } } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { 
        ticks: { color: themeMode === 'dark' ? '#9898b8' : '#475569' }, 
        grid: { color: themeMode === 'dark' ? '#2d2d45' : '#e2e8f0' } 
      },
      y: { 
        ticks: { color: themeMode === 'dark' ? '#9898b8' : '#475569' }, 
        grid: { color: themeMode === 'dark' ? '#2d2d45' : '#e2e8f0' } 
      },
    },
  };

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Good day, {user?.firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Here's an overview of your projects and active tasks today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ key, label, icon, color }) => (
          <div key={key} className="stat-card fade-in" style={{ '--accent': color } as React.CSSProperties}>
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
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Tasks by Status</h3>
          {loading ? <div className="skeleton" style={{ height: 250 }} /> : (
            statusChartData && statusChartData.labels.length > 0 ? (
              <Doughnut data={statusChartData} options={{ ...chartOptions, cutout: '65%' }} />
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No data yet
              </div>
            )
          )}
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Tasks by Priority</h3>
          {loading ? <div className="skeleton" style={{ height: 250 }} /> : (
            priorityChartData && priorityChartData.labels.length > 0 ? (
              <Bar data={priorityChartData} options={barOptions} />
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No data yet
              </div>
            )
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Recent Activity</h3>
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
                    {' '}{formatActivityText(a.type, a.data)}
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
