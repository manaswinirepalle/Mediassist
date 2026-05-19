'use client';

import { FormEvent, useState } from 'react';
import { Globe, Mail, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
  };

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your inbox for the login link.');
    }
  };

  return (
    <div className="grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Secure sign in</p>
        <h2 className="text-3xl font-semibold text-white">Access SpendWise AI</h2>
        <p className="max-w-2xl text-sm text-slate-300">Sign in with Google or email to unlock the audit dashboard, AI assistant, and premium reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={handleGoogle} disabled={loading} className="inline-flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-sm text-white transition hover:bg-slate-900">
          <Globe className="h-5 w-5" /> Sign in with Google
        </button>
        <button type="button" className="inline-flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-sm text-white transition hover:bg-slate-900" disabled>
          <ShieldCheck className="h-5 w-5" /> SSO & enterprise ready
        </button>
      </div>

      <form onSubmit={handleEmail} className="grid gap-3">
        <label className="text-sm text-slate-300">Email login</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            placeholder="hello@startup.com"
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-violet-300"
          />
          <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
            <Mail className="h-4 w-4" /> Send magic link
          </button>
        </div>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </form>
    </div>
  );
}
