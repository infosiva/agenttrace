'use client';

import { Activity, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginInner() {
  const params = useSearchParams();
  const checkEmail = params.get('check') === 'email';

  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    checkEmail ? 'sent' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('sending');
    setError(null);
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      });
      if (result?.error) {
        setError(result.error);
        setState('error');
      } else {
        setState('sent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error');
      setState('error');
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Activity className="w-6 h-6 text-green-500" />
        <span className="font-bold text-xl tracking-tight">AgentLogs</span>
        <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20 font-semibold uppercase tracking-wider">Beta</span>
      </div>

      <div className="border border-slate-800 bg-slate-950/60 rounded-lg p-8 backdrop-blur-sm">
        {state === 'sent' ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Check your email</h1>
            <p className="text-sm text-slate-400">
              We sent a sign-in link to{' '}
              <span className="text-green-400">{email || 'your inbox'}</span>.
              Click it to continue.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              Link expires in 24 hours. Didn&apos;t arrive?{' '}
              <button
                type="button"
                onClick={() => {
                  setState('idle');
                  setEmail('');
                }}
                className="text-green-400 hover:text-green-300 underline"
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-1">Sign in to AgentLogs</h1>
              <p className="text-sm text-slate-400">No password. We&apos;ll email you a magic link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-700 rounded-md text-sm text-white placeholder-slate-600 focus:border-green-500/60 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={state === 'sending' || !email}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-sm py-2.5 rounded-md transition"
              >
                {state === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send magic link →'
                )}
              </button>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                  {error}
                </p>
              )}
            </form>
          </>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center mt-6">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-slate-400 hover:text-green-400 underline">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-slate-400 hover:text-green-400 underline">Privacy</Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
          <LoginInner />
        </Suspense>
      </div>
    </main>
  );
}
