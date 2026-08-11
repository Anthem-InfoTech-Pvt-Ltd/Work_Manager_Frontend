'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api';

interface AuditLog { id: number; action: string; module: string; entityType?: string; ipAddress?: string; createdAt: string; }

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    auditApi.getLogs(undefined, 100).then(res => setLogs(res.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? logs.filter(l => l.module === filter || l.action.includes(filter)) : logs;

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1000, margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Audit Logs</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Track all system activities and changes</p>
        </div>
        <select className="input" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All modules</option>
          {['task','project','board','auth','user'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />) :
        filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p>No audit logs found</p>
          </div>
        ) : filtered.map(l => (
          <div key={l.id} className="card" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px 24px', fontSize: 13,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', textTransform: 'uppercase',
            }}>{l.module}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{l.action}</span>
            {l.entityType && <span style={{ color: 'var(--text-secondary)' }}>on {l.entityType}</span>}
            {l.ipAddress && <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: 12 }}>from {l.ipAddress}</span>}
            <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
              {new Date(l.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
