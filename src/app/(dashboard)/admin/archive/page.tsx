'use client';

import { useEffect, useState } from 'react';
import { projectsApi, boardsApi, listsApi, tasksApi, dashboardApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ConfirmModal } from '@/components/shared/ToastProvider';

interface ArchivedItem {
  id: number;
  title: string;
  type: 'project' | 'board' | 'list' | 'task';
  description?: string;
  context: string; // Project or Board context
}

export default function ArchivePage() {
  const { workspaceId } = useAuth();
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'task' | 'board' | 'list'>('all');
  const [toast, setToast] = useState<string | null>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadArchivedItems = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getArchivedItems();
      setItems(res.data.data || []);
    } catch (err) {
      showToast('Error loading archived items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchivedItems();
  }, [workspaceId]);

  const handleRestore = async (item: ArchivedItem) => {
    try {
      if (item.type === 'task') {
        await tasksApi.restore(item.id);
      } else if (item.type === 'list') {
        await listsApi.restore(item.id);
      } else if (item.type === 'board') {
        await boardsApi.restore(item.id);
      }
      showToast(`Restored ${item.type} "${item.title}"`);
      setItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } catch {
      showToast(`Failed to restore ${item.type}`);
    }
  };

  const handlePermanentDelete = async (item: ArchivedItem) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${item.type}?`,
      message: `Are you sure you want to permanently delete this ${item.type}? This action is irreversible.`,
      onConfirm: async () => {
        try {
          if (item.type === 'task') {
            await tasksApi.delete(item.id);
          } else if (item.type === 'list') {
            await listsApi.delete(item.id);
          } else if (item.type === 'board') {
            await boardsApi.delete(item.id);
          }
          showToast(`Permanently deleted ${item.type} "${item.title}"`);
          setItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
        } catch {
          showToast(`Failed to delete ${item.type}`);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredItems = items.filter(i => activeTab === 'all' || i.type === activeTab);

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 900, margin: '0 auto' }} className="fade-in">
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          padding: '12px 20px', borderRadius: 8,
          background: 'var(--accent)', color: '#fff', fontSize: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 1000
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Archive & Recovery Bin</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Browse and restore archived tasks, lists, boards, and projects, or permanently purge them.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, borderBottom: '1px solid var(--border)',
        marginBottom: 28, paddingBottom: 1
      }}>
        {(['all', 'task', 'board', 'list'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none',
              textTransform: 'capitalize'
            }}
          >
            {tab}s
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Scanning archive logs...</div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🧹</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Archive Bin is Empty</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No items match the selected tab filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredItems.map((item, idx) => (
            <div key={idx} className="card" style={{
              padding: '16px 20px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: 'var(--bg-hover)', color: 'var(--accent)', textTransform: 'uppercase'
                }}>
                  {item.type}
                </span>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.context} {item.description && `• ${item.description}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleRestore(item)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(item)}
                  className="btn btn-danger-outline btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
