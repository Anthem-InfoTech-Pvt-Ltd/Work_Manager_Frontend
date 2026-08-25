'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const e = searchParams.get('email');
    const t = searchParams.get('token');
    if (e) setEmail(e);
    if (t) setToken(t);
  }, [searchParams]);

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
    
    if (newPassword !== confirmPassword) {
      const errMsg = 'Passwords do not match.';
      setError(errMsg);
      showToast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({ email: email.trim(), token, newPassword });
      if (res.data.success) {
        showToast.success('Password has been reset successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const errMsg = res.data.message || 'Reset failed.';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred during password reset.';
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in" style={{ width: '100%', maxWidth: 440, padding: 36 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 0 20px rgba(99,102,241,0.4)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Reset Password</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Choose a secure new password for your account</p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 20
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>New Password</label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            maxLength={50}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Confirm New Password</label>
          <input
            type="password"
            className="input"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            maxLength={50}
          />
        </div>

        <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--text-secondary)' }}>
        Back to{' '}
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)', padding: 20
    }}>
      <Suspense fallback={<div>Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
