'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';
import { trackEvent } from './PostHogInit';
import { PublicHeader } from '@/components/PublicHeader';

// Illustrative example of the trace format. Not live data and not from a real customer.
const EXAMPLE_LINES = [
  { level: 'INFO', agent: 'research-agent', msg: 'task started: summarize papers' },
  { level: 'CALL', agent: 'research-agent', msg: 'tool_call: search_arxiv(query=...)' },
  { level: 'CALL', agent: 'research-agent', msg: 'llm_call: model=example tokens=4291' },
  { level: 'WARN', agent: 'summarizer', msg: 'rate limit approaching' },
  { level: 'ERROR', agent: 'writer-agent', msg: 'provider timeout, retrying with fallback' },
  { level: 'CALL', agent: 'writer-agent', msg: 'llm_call: fallback model' },
  { level: 'DONE', agent: 'writer-agent', msg: 'task complete, 5 steps' },
];

const LEVEL_COLOR: Record<string, string> = {
  INFO: 'text-slate-400', CALL: 'text-cyan-300', WARN: 'text-amber-300', ERROR: 'text-rose-300', DONE: 'text-emerald-300',
};

function TraceExample() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLDivElement[];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    els.forEach((el) => { el.style.opacity = '0'; });
    const timers = els.map((el, i) => window.setTimeout(() => { el.style.opacity = '1'; }, 350 + i * 450));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="rounded-xl border border-cyan-400/20 bg-[#0c111a] shadow-[0_0_60px_-20px_rgba(34,211,238,0.45)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-400/15 bg-[#101826]">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-xs text-slate-400">example trace format</span>
        <span className="ml-auto font-mono text-[10px] tracking-widest text-slate-400">ILLUSTRATIVE</span>
      </div>
      <div className="p-4 space-y-1.5 font-mono text-xs min-h-[15rem]">
        {EXAMPLE_LINES.map((l, i) => (
          <div key={i} ref={(el) => { refs.current[i] = el; }} className="flex gap-3 transition-opacity duration-500">
            <span className={`shrink-0 w-12 ${LEVEL_COLOR[l.level]}`}>{l.level}</span>
            <span className="text-cyan-200 shrink-0 hidden sm:inline">{l.agent}</span>
            <span className="text-slate-300 truncate">{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  ['Step-by-step traces', 'Every tool call and LLM call of an agent run, in order.'],
  ['Issue inbox', 'Failures grouped so you see what broke, not a wall of logs.'],
  ['Cost and latency per step', 'Token usage and timings recorded on each step you instrument.'],
  ['Python SDK', 'Context-manager tracing for custom agents. TypeScript SDK is planned.'],
  ['Self-hostable', 'Open source. Run it on your own infrastructure.'],
];

const STEPS = [
  ['Install', 'pip install agentlogs-sdk'],
  ['Configure', 'export AGENTLOGS_API_KEY="<your API key>"\nexport AGENTLOGS_PROJECT="my-agent"'],
  ['Instrument', `from agentlogs import AgentLogs

client = AgentLogs()
with client.trace("agent-run") as trace:
    trace.step("llm_call", metadata={"model": "gpt-4o", "tokens": 1200})
    # your agent logic
    trace.step("done", metadata={"output": result})`],
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c111a] text-slate-100">
      <PublicHeader />
      <main className="relative">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 border border-cyan-400/30 rounded-full px-3 py-1 mb-6">
              Open source · self-hostable
            </p>
            <h1 className="font-bold text-4xl sm:text-5xl leading-[1.1] text-white mb-5">
              See what your agents actually did.
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mb-8">
              Trace, debug and monitor AI agents in production, one step at a time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                onClick={() => trackEvent('hero_cta_clicked')}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] transition text-[#0c111a] font-semibold"
              >
                Open dashboard <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/infosiva/agenttrace"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] px-6 rounded-lg border border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 transition"
              >
                View on GitHub
              </Link>
            </div>
          </div>
          <TraceExample />
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-[1fr_2fr] gap-10">
          <h2 className="text-3xl font-bold text-white">What it does today</h2>
          <ul className="divide-y divide-cyan-400/10 border-y border-cyan-400/10">
            {FEATURES.map(([t, d]) => (
              <li key={t} className="py-4 flex gap-3">
                <Check className="w-4 h-4 mt-1 text-cyan-300 shrink-0" aria-hidden />
                <div><div className="font-semibold text-white">{t}</div><div className="text-slate-300 text-sm">{d}</div></div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-bold text-white mb-8">Instrument an agent</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            {STEPS.map(([label, code], i) => (
              <div key={label} className="rounded-lg border border-cyan-400/15 bg-[#101826] overflow-hidden">
                <div className="px-4 py-2 border-b border-cyan-400/10 font-mono text-xs text-cyan-300">0{i + 1} {label}</div>
                <pre className="p-4 overflow-x-auto"><code className="font-mono text-xs text-slate-200 whitespace-pre">{code}</code></pre>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-300">
            Plans and limits are on the <Link href="/pricing" className="text-cyan-300 underline underline-offset-2">pricing page</Link>. Paid plans are planned, not yet available.
          </p>
        </section>
      </main>
      <footer className="border-t border-cyan-400/10 py-8 text-center text-sm text-slate-400">AgentLogs. Open source under the MIT license.</footer>
    </div>
  );
}
