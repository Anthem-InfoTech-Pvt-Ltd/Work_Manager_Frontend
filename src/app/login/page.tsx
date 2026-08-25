'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { invitationsApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('admin@workmanager.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || undefined;

  useEffect(() => {
    if (token && inviteToken) {
      invitationsApi.accept(inviteToken)
        .then(() => {
          invitationsApi.validate(inviteToken)
            .then(inviteRes => {
              const boardId = inviteRes.data.data.boardId;
              router.push(`/boards/${boardId}`);
            })
            .catch(() => {
              router.push('/dashboard');
            });
        })
        .catch(() => {
          router.push('/dashboard');
        });
    }
  }, [token, inviteToken, router]);

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
      const { boardId } = await login(email.trim(), password, inviteToken);
      showToast.success('Logged in successfully!');
      if (boardId) {
        router.push(`/boards/${boardId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      let errMsg = 'Invalid email or password';
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, right: -100,
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 16, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(99,102,241,0.5)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>WorkManager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Enterprise Work Management Platform
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Welcome back! Please enter your details.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              color: '#f87171', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@workmanager.com"
                required
                id="email"
                maxLength={50}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                id="password"
                maxLength={50}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15 }}
              id="login-btn"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href={inviteToken ? `/register?invite=${inviteToken}` : "/register"} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>

          <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Default credentials:</strong><br/>
            Email: admin@workmanager.com<br/>
            Password: Admin@123
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
