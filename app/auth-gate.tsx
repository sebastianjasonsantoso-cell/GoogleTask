import { FormEvent, ReactNode, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

type AuthGateProps = { children: (user: User, signOut: () => Promise<void>) => ReactNode };

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

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

  async function requestMagicLink() {
    if (!supabase) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setError(''); setStatus('Sending your sign-in link…');
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    if (signInError) { setStatus(''); setError(signInError.message); return; }
    setEmail(normalizedEmail); setSent(true);
    setStatus(`A sign-in link was sent to ${normalizedEmail}.`);
  }

  async function sendMagicLink(event: FormEvent) { event.preventDefault(); await requestMagicLink(); }
  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  if (loading) return <main className="auth-page"><div className="auth-card auth-loading">Loading Google Tasks…</div></main>;
  if (user) return <>{children(user, signOut)}</>;

  return <main className="auth-page"><section className="auth-card" aria-labelledby="sign-in-title">
    <div className="auth-logo"><span>✓</span></div><p className="auth-product">Google Tasks</p><h1 id="sign-in-title">Sign in</h1><p className="auth-intro">Use your email to keep your task space personal.</p>
    {!isSupabaseConfigured ? <p className="auth-error">This app is missing its Supabase configuration.</p> : !sent ? <form onSubmit={sendMagicLink} className="auth-form">
      <label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required />
      {error && <p className="auth-error" role="alert">{error}</p>}{status && <p className="auth-status" role="status">{status}</p>}<button className="auth-primary" type="submit">Send sign-in link</button>
    </form> : <div className="auth-form">
      <p className="auth-status" role="status">{status}</p><p className="auth-hint">Open the link in your email to return here and sign in automatically.</p><button className="auth-primary" type="button" onClick={() => void requestMagicLink()}>Resend sign-in link</button><button className="auth-secondary" type="button" onClick={() => { setSent(false); setStatus(''); setError(''); }}>Use a different email</button>
    </div>}
  </section></main>;
}
