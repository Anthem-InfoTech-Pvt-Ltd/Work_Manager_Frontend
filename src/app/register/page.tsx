'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({
        email,
        password,
        firstName,
        lastName,
      });

      if (res.data.success) {
        localStorage.setItem('wm_token', res.data.data.token);
        localStorage.setItem('wm_user', JSON.stringify(res.data.data.user));
        router.push('/dashboard');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
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
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create an Account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Get started with WorkManager today</p>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
              <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
              <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Work Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@workmanager.com" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
