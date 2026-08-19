'use client';

import React, { useEffect, useState } from 'react';
import { errorLogsApi } from '@/lib/api';
import { formatDateTimeDDMMYYYY12h } from '@/lib/format';
import { ShieldAlert, Trash2, Search, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { showToast, ConfirmModal } from '@/components/shared/ToastProvider';
import Link from 'next/link';

interface ErrorLog {
  id: number;
  message: string;
  stackTrace?: string;
  route?: string;
  userId?: number;
  createdAt: string;
  userName?: string;
}

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await errorLogsApi.getAll();
      setLogs(res.data.data ?? []);
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to fetch error logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const clearAllLogs = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Error Logs?',
      message: 'Are you sure you want to permanently clear all system error logs?',
      onConfirm: async () => {
        try {
          await errorLogsApi.clearAll();
          setLogs([]);
          showToast.success('All logs cleared successfully.');
        } catch (err: any) {
          showToast.error(err.response?.data?.message || 'Failed to clear error logs.');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.route && log.route.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.userName && log.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Control Center
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>System Error Logs</h1>
            <span style={{ fontSize: 12, padding: '4px 8px', background: '#ef44441a', color: '#ef4444', borderRadius: '12px', fontWeight: 600 }}>Captured logs</span>
          </div>
        </div>

        {logs.length > 0 && (
          <button onClick={clearAllLogs} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: '#ef4444', color: '#ef4444' }}>
            <Trash2 size={14} /> Clear All Logs
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by error message, route path, or user name..."
            style={{ paddingLeft: 40 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary btn-sm" style={{ padding: '0 16px' }}>Refresh</button>
      </div>

      {/* Main Grid/List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading system exception logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', border: '1px dashed var(--border)', borderRadius: 12, background: 'var(--bg-secondary)', gap: 12 }}>
          <ShieldAlert size={48} style={{ color: 'var(--text-muted)' }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>All quiet! No logs found.</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
              {searchTerm ? 'Try adjusting your search filters.' : 'No exceptions or unhandled server crashes have been captured.'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'var(--bg-card)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ color: '#ef4444', flexShrink: 0 }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {log.message}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {log.route && (
                        <span>
                          <strong>Route:</strong> <code>{log.route}</code>
                        </span>
                      )}
                      <span>
                        <strong>Logged:</strong> {formatDateTimeDDMMYYYY12h(log.createdAt)}
                      </span>
                      <span>
                        <strong>User:</strong> {log.userName || (log.userId ? `ID: ${log.userId}` : 'Guest/System')}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '14px 0 6px' }}>
                      Stack Trace
                    </p>
                    <pre
                      style={{
                        padding: 16,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontSize: 12,
                        lineHeight: '1.6',
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        margin: 0,
                      }}
                    >
                      {log.stackTrace || 'No stack trace details provided.'}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
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
