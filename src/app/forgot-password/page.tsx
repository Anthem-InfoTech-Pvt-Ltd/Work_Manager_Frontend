'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(email.trim())) {
      const errMsg = 'Please enter a valid email address.';
      setError(errMsg);
      showToast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.data.success) {
        showToast.success('Password reset link has been sent to your email.');
        setEmail('');
      } else {
        const errMsg = res.data.message || 'Request failed.';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred. Make sure email exists.';
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Forgot Password</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>We'll send you a password reset link</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 20
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@workmanager.com"
              required
              maxLength={50}
            />
          </div>

          <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--text-secondary)' }}>
          Back to{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
