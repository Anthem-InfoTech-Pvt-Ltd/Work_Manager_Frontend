'use client';

import { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, invitationsApi, planApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { showToast } from '@/components/shared/ToastProvider';
import { validateEmail, validatePassword } from '@/lib/validation';

interface DbPlan {
  id: number;
  name: string;
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxBoardsPerProject: number;
  maxMembersPerWorkspace: number;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || undefined;
  const planParam = searchParams.get('planId') || searchParams.get('plan');
  const { token } = useAuth();

  const [selectedDbPlan, setSelectedDbPlan] = useState<DbPlan | null>(null);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    planApi.getPublicPlans()
      .then(res => {
        if (res.data?.data) {
          const list: DbPlan[] = res.data.data;
          const match = planParam
            ? list.find(p =>
                String(p.id) === String(planParam) ||
                p.name.toLowerCase() === String(planParam).toLowerCase()
              )
            : list.find(p => p.name.toLowerCase() === 'free') || list[0];

          if (match) {
            setSelectedDbPlan(match);
          }
        }
      })
      .catch(() => { });
  }, [planParam]);

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
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);



  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      const errMsg = 'Please enter your first name.';
      setError(errMsg);
      showToast.error(errMsg);
      return;
    }

    if (!lastName.trim()) {
      const errMsg = 'Please enter your last name.';
      setError(errMsg);
      showToast.error(errMsg);
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      showToast.error(emailErr);
      return;
    }

    const passwordErr = validatePassword(password, 'Password');
    if (passwordErr) {
      setError(passwordErr);
      showToast.error(passwordErr);
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.sendOtp(email.trim(), firstName.trim());
      if (res.data.success) {
        showToast.success('Verification code sent to your email!');
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        const errMsg = res.data.message || 'Failed to send verification code.';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred while sending verification code.';
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setLoading(true);

    try {
      const res = await authApi.sendOtp(email.trim(), firstName.trim());
      if (res.data.success) {
        showToast.success('New verification code sent!');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        showToast.error(res.data.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
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
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      const errMsg = 'Please enter all 6 digits of the verification code.';
      setError(errMsg);
      showToast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await authApi.verifyOtp(email.trim(), otpCode);
      if (!verifyRes.data.success) {
        const errMsg = verifyRes.data.message || 'Invalid or expired verification code.';
        setError(errMsg);
        showToast.error(errMsg);
        setLoading(false);
        return;
      }

      // 2. Complete Registration
      const regRes = await authApi.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        inviteToken,
      });

      if (regRes.data.success) {
        showToast.success('Account created successfully! Please login.');
        router.push(inviteToken ? `/login?invite=${inviteToken}` : '/login');
      } else {
        const errMsg = regRes.data.message || 'Registration failed';
        setError(errMsg);
        showToast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'An error occurred during verification.';
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            {step === 'details' ? 'Create an Account' : 'Verify Your Email'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 'details'
              ? 'Get started with WorkManager today'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {selectedDbPlan && step === 'details' && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'var(--accent-glow)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 2 }}>
                Selected Plan
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedDbPlan.name} Plan
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {selectedDbPlan.maxProjectsPerWorkspace === 0 ? 'Unlimited Projects' : `${selectedDbPlan.maxProjectsPerWorkspace} Projects`} • {selectedDbPlan.maxMembersPerWorkspace === 0 ? 'Unlimited Members' : `${selectedDbPlan.maxMembersPerWorkspace} Members`}
              </div>
            </div>
            <Link href="/plans" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
              Change
            </Link>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: 13, marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {step === 'details' ? (
          /* ── STEP 1: Details Form ──────────────────────────────────── */
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>First Name</label>
                <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rahul" maxLength={50} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Last Name</label>
                <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Sharma" maxLength={50} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Work Email</label>
              <input type="text" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@workmanager.com" maxLength={50} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" maxLength={50} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Must be at least 6 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code →'}
            </button>
          </form>
        ) : (
          /* ── STEP 2: 6-Digit OTP Box Verification ──────────────────── */
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
                Enter 6-Digit Verification Code
              </label>

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
                  onClick={handleResendOtp}
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
                onClick={() => setStep('details')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
              >
                Edit Email
              </button>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Verifying & Registering...' : 'Register'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href={inviteToken ? `/login?invite=${inviteToken}` : "/login"} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
