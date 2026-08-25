'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [token, setToken] = useState('');

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setToken('');

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        // Save token to state so user can copy it or click the direct button
        setToken(res.data.data);
      } else {
        setError(res.data.message || 'Request failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Make sure email exists.');
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
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>We'll help you reset your account credentials</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {successMsg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: '16px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: 14, lineHeight: 1.5
            }}>
              <strong>Success!</strong><br />
              {successMsg}
            </div>

            {token && (
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Your Demo Reset Token:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)' }}>{token}</code>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)}
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '11px 20px' }}
            >
              Proceed to Reset Password →
            </button>
          </div>
        ) : (
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
              {loading ? 'Sending Request...' : 'Request Reset Token'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--text-secondary)' }}>
          Back to{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
