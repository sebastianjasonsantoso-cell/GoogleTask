import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthGateProps = { children: (user: User, signOut: () => Promise<void>) => ReactNode };

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) { setUser(session?.user ?? null); setLoading(false); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUser(session?.user ?? null); setLoading(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  async function requestCode() {
    if (!supabase) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setError(''); setStatus('Sending your verification code…');
    const { error: signInError } = await supabase.auth.signInWithOtp({ email: normalizedEmail });
    if (signInError) { setStatus(''); setError(signInError.message); return; }
    setEmail(normalizedEmail); setCode(''); setStep('code');
    setStatus(`A 6-digit code was sent to ${normalizedEmail}.`);
    window.setTimeout(() => codeInput.current?.focus(), 0);
  }

  async function sendCode(event: FormEvent) { event.preventDefault(); await requestCode(); }
  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    if (!supabase || code.length !== 6) return;
    setError(''); setStatus('Verifying your code…');
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (verifyError) { setStatus(''); setError('That code is invalid or has expired. Request a new one and try again.'); }
  }
  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  if (loading) return <main className="auth-page"><div className="auth-card auth-loading">Loading Google Tasks…</div></main>;
  if (user) return <>{children(user, signOut)}</>;

  return <main className="auth-page"><section className="auth-card" aria-labelledby="sign-in-title">
    <div className="auth-logo"><span>✓</span></div><p className="auth-product">Google Tasks</p><h1 id="sign-in-title">Sign in</h1><p className="auth-intro">Use your email to keep your task space personal.</p>
    {!isSupabaseConfigured ? <p className="auth-error">This app is missing its Supabase configuration.</p> : step === 'email' ? <form onSubmit={sendCode} className="auth-form">
      <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required />
      {error && <p className="auth-error" role="alert">{error}</p>}{status && <p className="auth-status" role="status">{status}</p>}<button className="auth-primary" type="submit">Send verification code</button>
    </form> : <form onSubmit={verifyCode} className="auth-form">
      <button className="auth-back" type="button" onClick={() => { setStep('email'); setStatus(''); setError(''); }} aria-label="Use a different email">← {email}</button><label htmlFor="otp">Verification code</label><input ref={codeInput} id="otp" className="otp-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" required />
      <p className="auth-hint">Enter the 6-digit code from your email.</p>{error && <p className="auth-error" role="alert">{error}</p>}{status && <p className="auth-status" role="status">{status}</p>}<button className="auth-primary" type="submit" disabled={code.length !== 6}>Verify and continue</button><button className="auth-secondary" type="button" onClick={() => void requestCode()}>Resend code</button>
    </form>}
  </section></main>;
}
