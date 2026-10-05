'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Activity, Clock, AlertCircle, Hash, Lock } from 'lucide-react';
import { trackEvent } from '@/app/PostHogInit';
import { SANDBOX_TRACES } from '@/lib/sandbox-fixtures';

export default function SandboxDashboard() {
  useEffect(() => { trackEvent('guest_sandbox_viewed'); }, []);

  const finished = SANDBOX_TRACES.filter(t => t.status !== 'running');
  const errors = SANDBOX_TRACES.filter(t => t.status === 'error').length;
  const avg = finished.length ? Math.round(finished.reduce((s, t) => s + t.durationMs, 0) / finished.length) : 0;
  const tokens = SANDBOX_TRACES.reduce((s, t) => s + t.tokens, 0);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-mono">
      <div className="sticky top-0 z-10 bg-[#020617] border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400">
          SAMPLE DATA
        </span>
        <Link href="/login" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-4 py-2 rounded">
          Sign up free to send your own traces
        </Link>
      </div>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <header className="mb-8">
          <p className="text-xs text-cyan-600 uppercase tracking-widest mb-2">// sandbox: read-only sample</p>
          <h1 className="text-3xl font-bold text-white">Sample project</h1>
          <p className="text-sm text-slate-400 mt-1">Fixture data, not real traces. Nothing here is saved.</p>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Metric icon={Activity} label="Traces" value={String(SANDBOX_TRACES.length)} accent="text-cyan-400" />
          <Metric icon={AlertCircle} label="Errors" value={String(errors)} accent="text-red-400" />
          <Metric icon={Clock} label="Avg duration" value={`${avg}ms`} accent="text-cyan-400" />
          <Metric icon={Hash} label="Total tokens" value={tokens.toLocaleString()} accent="text-cyan-400" />
        </section>

        <section className="border border-slate-800 rounded-lg bg-slate-950 overflow-x-auto">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent traces (sample)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-black/40 border-b border-slate-800">
              <tr>
                {['Name', 'Status', 'Duration', 'Tokens', 'Cost', 'Time'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase px-4 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SANDBOX_TRACES.map(t => (
                <tr key={t.id} className="border-b border-slate-900 last:border-0">
                  <td className="px-4 py-3 text-slate-200">{t.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-slate-400">{t.durationMs ? `${t.durationMs}ms` : '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{t.tokens.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400">${t.costUsd.toFixed(4)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.minutesAgo}m ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
          <Locked label="30-day retention" />
          <Locked label="Unlimited projects" />
        </section>
      </div>
    </main>
  );
}

function Locked({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-slate-800 bg-slate-950 rounded px-3 py-1.5">
      <Lock className="w-3 h-3" /> {label}
      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">Pro</span>
    </span>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Activity; label: string; value: string; accent: string }) {
  return (
    <div className="border border-slate-800 bg-slate-950 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    running: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status] ?? styles.running}`}>
      {status}
    </span>
  );
}
