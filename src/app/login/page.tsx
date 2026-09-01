'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { authApi, invitationsApi } from '@/lib/api';
import { showToast } from '@/components/shared/ToastProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('admin@workmanager.com');
  const [password, setPassword] = useState('Admin@123');
  
  // OTP State
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

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

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loginMethod === 'otp' && otpStep === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [loginMethod, otpStep, timer]);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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

  const handleSendLoginOtp = async (e: React.FormEvent) => {
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
      const res = await authApi.sendLoginOtp(email.trim());
      if (res.data.success) {
        showToast.success('Login verification code sent to your email!');
        setOtpStep('verify');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        const errMsg = res.data.message || 'Failed to send login code.';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred while sending login code.';
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);

    try {
      const res = await authApi.sendLoginOtp(email.trim());
      if (res.data.success) {
        showToast.success('New login code sent!');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showToast.error(res.data.message || 'Failed to resend login code.');
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to resend login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleLoginWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the login code.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.loginWithOtp(email.trim(), otpCode, inviteToken);
      if (res.data.success) {
        showToast.success('Logged in successfully!');
        const { token, user, boardId, workspaceId } = res.data.data;
        localStorage.setItem('wm_token', token);
        localStorage.setItem('wm_user', JSON.stringify(user));
        if (workspaceId) {
          localStorage.setItem('wm_ws_id', String(workspaceId));
        }
        if (boardId) {
          router.push(`/boards/${boardId}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        const errMsg = res.data.message || 'Login failed';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid or expired login code.';
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
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
          padding: 36,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {/* Method Toggle Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: 4,
            borderRadius: 12,
            marginBottom: 28,
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => { setLoginMethod('password'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: loginMethod === 'password' ? 'var(--accent)' : 'transparent',
                color: loginMethod === 'password' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              🔑 Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('otp'); setOtpStep('request'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: loginMethod === 'otp' ? 'var(--accent)' : 'transparent',
                color: loginMethod === 'otp' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              ✉️ Email OTP Login
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              color: '#f87171', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          {loginMethod === 'password' ? (
            /* ── OPTION 1: Password Login ──────────────────────────────── */
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
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
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                {loading ? 'Logging in...' : 'Login with Password →'}
              </button>
            </form>
          ) : (
            /* ── OPTION 2: OTP Login ───────────────────────────────────── */
            otpStep === 'request' ? (
              <form onSubmit={handleSendLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Work Email Address
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rahul@workmanager.com"
                    required
                    maxLength={50}
                  />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    We'll email you a 6-digit login verification code.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15 }}
                >
                  {loading ? 'Sending Code...' : 'Send Login Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginWithOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '8px 0 16px' }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        style={{
                          width: 46,
                          height: 52,
                          fontSize: 22,
                          fontWeight: 800,
                          textAlign: 'center',
                          borderRadius: 10,
                          border: digit ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          boxShadow: digit ? '0 0 10px var(--accent-glow)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendLoginOtp}
                      disabled={loading}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span>Resend code in <strong>{timer}s</strong></span>
                  )}
                  <span style={{ margin: '0 8px', color: 'var(--border)' }}>•</span>
                  <button
                    type="button"
                    onClick={() => setOtpStep('request')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit Email
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 15 }}
                >
                  {loading ? 'Logging in...' : 'Verify Code & Log In ✓'}
                </button>
              </form>
            )
          )}

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
