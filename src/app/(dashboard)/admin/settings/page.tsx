'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';

interface SettingItem {
  id: number;
  key: string;
  value: string | null;
  dataType: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'security'>('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    settingsApi.getAll()
      .then(res => {
        setSettings(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        showToast('Failed to load settings', 'error');
        setLoading(false);
      });
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleValueChange = (key: string, val: string) => {
    setSettings(prev =>
      prev.map(s => s.key === key ? { ...s, value: val } : s)
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = settings.map(s => ({ key: s.key, value: s.value }));
      await settingsApi.save(payload);
      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || '';
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 32px 64px', maxWidth: 800, margin: '0 auto' }}>
        <div className="animate-pulse" style={{ height: 40, width: 200, background: 'var(--bg-hover)', borderRadius: 8, marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 38, width: 100, background: 'var(--bg-hover)', borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 72, background: 'var(--bg-hover)', borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 800, margin: '0 auto' }} className="fade-in">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          padding: '12px 20px', borderRadius: 8,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', fontSize: 14, fontWeight: 500,
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span>{toast.type === 'success' ? '✓' : '✗'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>System Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Configure global work parameters, layout branding, and platform options.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '10px 24px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, borderBottom: '1px solid var(--border)',
        marginBottom: 32, paddingBottom: 1
      }}>
        {(['general', 'branding', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none',
              textTransform: 'capitalize', transition: 'all 0.15s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Localization & Regional</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Default Timezone
                  </label>
                  <select
                    className="input"
                    value={getSettingValue('timezone.default')}
                    onChange={e => handleValueChange('timezone.default', e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-primary)' }}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Default Language
                  </label>
                  <select
                    className="input"
                    value={getSettingValue('language.default')}
                    onChange={e => handleValueChange('language.default', e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-primary)' }}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Date Format
                  </label>
                  <select
                    className="input"
                    value={getSettingValue('date.format')}
                    onChange={e => handleValueChange('date.format', e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-primary)' }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 15/08/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/15/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-15)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Time Format
                  </label>
                  <select
                    className="input"
                    value={getSettingValue('time.format')}
                    onChange={e => handleValueChange('time.format', e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-primary)' }}
                  >
                    <option value="12h">12-hour (e.g. 05:30 PM)</option>
                    <option value="24h">24-hour (e.g. 17:30)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Application Identity</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Application Name
                </label>
                <input
                  className="input"
                  value={getSettingValue('app.name')}
                  onChange={e => handleValueChange('app.name', e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  App Version Label
                </label>
                <input
                  className="input"
                  value={getSettingValue('app.version')}
                  disabled
                  style={{ width: '100%', background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Default Light/Dark Theme
                </label>
                <select
                  className="input"
                  value={getSettingValue('theme.default')}
                  onChange={e => handleValueChange('theme.default', e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                >
                  <option value="dark">Dark Theme (Recommended)</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Attachment & Upload Limits</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  className="input"
                  value={getSettingValue('attachment.max_size_mb')}
                  onChange={e => handleValueChange('attachment.max_size_mb', e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Allowed MIME Types / File Extensions
                </label>
                <input
                  className="input"
                  value={getSettingValue('attachment.allowed_types')}
                  onChange={e => handleValueChange('attachment.allowed_types', e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: 12 }}
                  placeholder="e.g. image/*,application/pdf,.doc,.docx"
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Comma-separated list of formats allowed for task uploads.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
