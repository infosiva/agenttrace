'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, BarChart3, Clock, DollarSign, Check, Zap, Shield, Code2, TrendingUp, Terminal, AlertCircle, Radio, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroGuide from '@/components/AnimatedHeroGuide';

const LOG_LINES = [
  { time: '14:32:01.423', level: 'INFO', agent: 'research-agent', msg: 'Starting task: "Summarize latest AI papers"', color: 'text-cyan-400' },
  { time: '14:32:01.891', level: 'CALL', agent: 'research-agent', msg: 'tool_call: search_arxiv(query="transformer architecture 2024")', color: 'text-cyan-400' },
  { time: '14:32:02.340', level: 'INFO', agent: 'research-agent', msg: 'Retrieved 47 papers, filtering by relevance score > 0.85', color: 'text-cyan-400' },
  { time: '14:32:02.891', level: 'CALL', agent: 'research-agent', msg: 'llm_call: claude-3-5-sonnet (tokens: 4,291)', color: 'text-cyan-400' },
  { time: '14:32:04.102', level: 'INFO', agent: 'research-agent', msg: 'Step completed: latency=1.2s cost=$0.0043', color: 'text-cyan-400' },
  { time: '14:32:04.201', level: 'WARN', agent: 'summarizer', msg: 'Rate limit approaching: 85% of quota used', color: 'text-yellow-400' },
  { time: '14:32:04.890', level: 'CALL', agent: 'summarizer', msg: 'tool_call: fetch_url(url="https://arxiv.org/abs/2401.12345")', color: 'text-cyan-400' },
  { time: '14:32:05.112', level: 'INFO', agent: 'summarizer', msg: 'Chunk 1/3 processed: 2,048 tokens compressed to 312', color: 'text-cyan-400' },
  { time: '14:32:05.445', level: 'INFO', agent: 'summarizer', msg: 'Chunk 2/3 processed: 1,891 tokens compressed to 287', color: 'text-cyan-400' },
  { time: '14:32:05.901', level: 'INFO', agent: 'summarizer', msg: 'Chunk 3/3 processed: 2,143 tokens compressed to 321', color: 'text-cyan-400' },
  { time: '14:32:06.003', level: 'DONE', agent: 'research-agent', msg: 'Task complete — total: 3.58s / $0.0124 / 5 steps', color: 'text-cyan-300' },
  { time: '14:32:06.244', level: 'INFO', agent: 'monitor', msg: 'Trace saved: trace_7f3a9b2c [id: 7f3a9b2c]', color: 'text-cyan-400' },
  { time: '14:32:07.001', level: 'INFO', agent: 'writer-agent', msg: 'Starting task: "Draft blog post from summary"', color: 'text-cyan-400' },
  { time: '14:32:07.445', level: 'CALL', agent: 'writer-agent', msg: 'llm_call: gpt-4o (tokens: 1,102)', color: 'text-cyan-400' },
  { time: '14:32:08.330', level: 'ERROR', agent: 'writer-agent', msg: 'OpenAI timeout after 1000ms — retrying with fallback', color: 'text-red-400' },
  { time: '14:32:08.891', level: 'CALL', agent: 'writer-agent', msg: 'llm_call: claude-3-haiku (fallback, tokens: 1,102)', color: 'text-cyan-400' },
  { time: '14:32:09.210', level: 'DONE', agent: 'writer-agent', msg: 'Draft complete — 847 words / latency 1.78s / $0.0031', color: 'text-cyan-300' },
];

const METRICS = [
  { label: 'Req/sec', value: '2,847', delta: '+12%', color: 'text-cyan-400' },
  { label: 'P99 Latency', value: '1.24s', delta: '-8ms', color: 'text-cyan-400' },
  { label: 'Error Rate', value: '0.3%', delta: '-0.1%', color: 'text-cyan-400' },
  { label: 'Cost/1k', value: '$0.041', delta: '-4%', color: 'text-cyan-400' },
];

function LogStream() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    let tl: gsap.core.Timeline | undefined;

    import('gsap').then(({ default: gsap }) => {
      if (cancelled) return;
      const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(lines, { autoAlpha: 0, y: 6 });

      tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
      lines.forEach((el, i) => {
        tl!.to(el, {
          autoAlpha: 0.9,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          onStart: () => {
            containerRef.current?.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
          },
        }, i === 0 ? 0 : '+=0.25');
      });
      tl.set(lines, { autoAlpha: 0, y: 6 }, '+=0.8');
    });

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div className="terminal-panel rounded-lg border border-cyan-900/60 bg-black/90 overflow-hidden">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-cyan-900/40">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-cyan-500/80" />
        <span className="ml-3 font-mono text-xs text-cyan-600">agentlogs.app — live trace stream</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 live-dot" />
          <span className="font-mono text-xs text-cyan-500 tracking-widest">LIVE</span>
        </span>
      </div>
      {/* Log body */}
      <div
        ref={containerRef}
        className="p-4 h-72 overflow-y-auto space-y-1 font-mono text-xs scrollbar-hide"
      >
        {LOG_LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            className="flex gap-3 hover:opacity-100 transition-opacity min-w-0 overflow-hidden"
          >
            <span className="text-gray-600 shrink-0">{line.time}</span>
            <span className={`shrink-0 w-10 ${
              line.level === 'ERROR' ? 'text-red-400' :
              line.level === 'WARN' ? 'text-yellow-400' :
              line.level === 'CALL' ? 'text-cyan-400' :
              line.level === 'DONE' ? 'text-cyan-300' : 'text-cyan-600'
            }`}>[{line.level}]</span>
            <span className="text-purple-400 shrink-0">{line.agent}</span>
            <span className={`${line.color} truncate`}>{line.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {METRICS.map((m, i) => (
        <div key={i} className="terminal-panel rounded-lg border border-cyan-900/50 bg-black/80 p-4">
          <div className="font-mono text-xs text-cyan-600 mb-1 uppercase tracking-widest">{m.label}</div>
          <div className={`font-mono text-2xl font-bold ${m.color} tabular-nums metric-glow`}>{m.value}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`font-mono text-xs ${m.delta.startsWith('-') && m.label !== 'P99 Latency' && m.label !== 'Error Rate' ? 'text-red-400' : 'text-cyan-500'}`}>{m.delta}</span>
            <span className="font-mono text-xs text-gray-600">24h</span>
            <span className={`ml-auto w-1.5 h-1.5 rounded-full ${tick % 2 === i % 2 ? 'bg-cyan-400' : 'bg-cyan-800'} transition-colors duration-500`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const PRO_FEATURES = [
  '1,000,000 trace events / month',
  '30-day log retention',
  'Unlimited projects',
  'Team seats (up to 5)',
  'Webhook + REST API export',
  'Email support (24h SLA)',
];

const FREE_FEATURES = [
  '10,000 trace events / month',
  '7-day log retention',
  '1 project',
  'Community support',
];

export default function HomePage() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProBanner, setShowProBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Restore pro state from localStorage
    if (localStorage.getItem('agenttrace-pro') === 'true') {
      setIsPro(true);
    }
    // Handle ?upgraded=1 redirect from Stripe success
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === '1') {
      localStorage.setItem('agenttrace-pro', 'true');
      setIsPro(true);
      setShowProBanner(true);
      // Clean the URL without a reload
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setShowProBanner(false), 6000);
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-gray-100">
      <AnimatedHeroGuide />
      {/* Pro upgrade success banner */}
      {showProBanner && (
        <div className="pro-banner fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 bg-cyan-500 text-black font-mono text-sm font-bold py-3 px-4">
          <Check className="w-4 h-4" />
          Welcome to AgentTrace Pro! Unlimited logs, alerting, and team access are now active.
        </div>
      )}

      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34,211,238,0.06) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(103,232,249,0.04) 0%, transparent 50%)`,
      }} />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-cyan-900/40 bg-black/80 backdrop-blur">
        <nav className="container mx-auto max-w-6xl flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 mr-8">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span className="font-mono font-bold text-cyan-400 tracking-tight">AgentTrace</span>
            <span className="hidden sm:block font-mono text-xs text-cyan-700 border border-cyan-900 px-1.5 py-0.5 rounded">v2.0</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-mono">
            {['Features', 'Integrations', 'Pricing', 'Docs'].map(item => (
              <Link
                key={item}
                href={item === 'Features' ? '#features' : `/${item.toLowerCase()}`}
                className="text-cyan-700 hover:text-cyan-400 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="font-mono text-sm text-cyan-700 hover:text-cyan-400 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/dashboard" className="font-mono text-sm bg-cyan-500/10 border border-cyan-600/50 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded transition-colors">
              Dashboard →
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="container mx-auto max-w-6xl px-4 pt-20 pb-12">
          {/* Trust badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 font-mono text-xs border border-cyan-900/70 bg-cyan-950/30 text-cyan-500 px-3 py-1.5 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              Open Source
              <span className="text-cyan-700">·</span>
              Self-Hostable
            </span>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-mono font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
              Agent observability{' '}
              <span className="text-cyan-400">built for agents</span>
              <br />
              <span className="text-cyan-400 text-3xl sm:text-4xl md:text-5xl">— not retrofitted from LLM logging.</span>
            </h1>
            <p className="text-cyan-700 text-lg sm:text-xl max-w-2xl mx-auto font-mono leading-relaxed">
              Real-time trace view, issue lifecycle tracking, and step-by-step execution<br className="hidden sm:block" />
              — for AI agents that actually run.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/dashboard" className="font-mono text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded transition-colors flex items-center gap-2">
                Start free — no card needed
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="https://github.com/infosiva/agenttrace" target="_blank" className="font-mono text-sm border border-cyan-800 text-cyan-600 hover:border-cyan-600 hover:text-cyan-400 px-6 py-3 rounded transition-colors">
                $ git clone infosiva/agenttrace
              </Link>
            </div>
          </div>

          {/* Live log stream */}
          <LogStream />

          {/* Metrics */}
          <div className="mt-4">
            <MetricsPanel />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <div className="font-mono text-xs text-cyan-600 uppercase tracking-widest mb-3">// capabilities</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">
              Everything you need to ship reliable AI
            </h2>
            <p className="text-cyan-700 font-mono">Built-in observability. Zero vendor lock-in. Works with any framework.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Activity, title: 'Real-time Tracing', desc: 'Watch agents think step-by-step with full execution visibility' },
              { icon: DollarSign, title: 'Cost Analytics', desc: 'Track token usage and API costs across every agent run' },
              { icon: Clock, title: 'Latency Profiling', desc: 'Find bottlenecks. P50/P95/P99 breakdowns per step' },
              { icon: AlertCircle, title: 'Error Detection', desc: 'Auto-categorize failures. Alert before users notice' },
              { icon: Zap, title: 'Multi-Framework', desc: 'LangChain, CrewAI, AutoGPT, or your own custom agents' },
              { icon: Shield, title: 'Self-Hostable', desc: 'Your data never leaves your infra. Docker in 2 minutes' },
              { icon: Code2, title: 'SDK First', desc: 'Python + TypeScript. 3 lines to full instrumentation' },
              { icon: TrendingUp, title: 'Production Scale', desc: 'Built on FastAPI + Postgres. Async event ingestion designed to scale' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group border border-cyan-900/50 bg-black/60 rounded-lg p-5 hover:border-cyan-700/70 hover:bg-cyan-950/20 transition-all">
                <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center mb-3 group-hover:border-cyan-600 transition-colors">
                  <Icon className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="font-mono font-semibold text-cyan-300 text-sm mb-1">{title}</div>
                <div className="font-mono text-xs text-cyan-700 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center mb-10">
            <div className="font-mono text-xs text-cyan-600 uppercase tracking-widest mb-3">// quickstart</div>
            <h2 className="font-mono font-bold text-3xl text-white">Instrument in 60 seconds</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { step: '01', label: 'Install SDK', code: 'pip install agenttrace-sdk' },
              { step: '02', label: 'Set endpoint', code: 'export AGENTTRACE_API_URL="https://agentlogs.app"\nexport AGENTTRACE_PROJECT="my-agent"' },
              { step: '03', label: 'Instrument', code: `from agenttrace import AgentTrace

client = AgentTrace()
with client.trace("agent-run") as trace:
    trace.step("llm_call", metadata={"model": "gpt-4o", "tokens": 1200})
    # your agent logic
    trace.step("done", metadata={"output": result})` },
            ].map(({ step, label, code }) => (
              <div key={step} className="border border-cyan-900/50 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/80 border-b border-cyan-900/30">
                  <span className="font-mono text-xs text-cyan-700">{step}</span>
                  <span className="font-mono text-xs text-cyan-500">{label}</span>
                </div>
                <pre className="p-4 bg-black/90 overflow-x-auto max-w-full">
                  <code className="font-mono text-xs text-cyan-400 whitespace-pre">{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing / Pro */}
        <section className="container mx-auto max-w-6xl px-4 py-20" id="pricing">
          <div className="text-center mb-12">
            <div className="font-mono text-xs text-cyan-600 uppercase tracking-widest mb-3">// pricing</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">Simple. Developer-first.</h2>
            <p className="text-cyan-700 font-mono">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="border border-cyan-900/50 rounded-lg p-6 bg-black/60">
              <div className="font-mono text-xs text-cyan-700 uppercase tracking-widest mb-2">Free</div>
              <div className="font-mono text-4xl font-bold text-white mb-1">$0</div>
              <div className="font-mono text-xs text-cyan-700 mb-6">Forever free, open source</div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 font-mono text-sm text-cyan-600">
                    <Check className="w-4 h-4 text-cyan-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block text-center font-mono text-sm border border-cyan-800 text-cyan-600 hover:border-cyan-600 hover:text-cyan-400 px-4 py-2.5 rounded transition-colors">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-cyan-500/50 rounded-lg p-6 bg-cyan-950/20 relative">
              <div className="absolute top-4 right-4 font-mono text-xs bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 px-2 py-0.5 rounded">
                POPULAR
              </div>
              <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2">Pro</div>
              <div className="font-mono text-4xl font-bold text-white mb-1">$19</div>
              <div className="font-mono text-xs text-cyan-600 mb-6">per month, billed monthly</div>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 font-mono text-sm text-cyan-400">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="text-center font-mono text-sm text-cyan-400 border border-cyan-600/50 px-4 py-2.5 rounded bg-cyan-950/40">
                  ✓ You are on Pro
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full font-mono text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-4 py-2.5 rounded transition-colors"
                >
                  {loading ? 'Redirecting...' : 'Upgrade to Pro — $19/mo'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="container mx-auto max-w-6xl px-4 py-12 pb-20">
          <div className="text-center mb-10">
            <div className="font-mono text-xs text-cyan-600 uppercase tracking-widest mb-3">// compare</div>
            <h2 className="font-mono font-bold text-3xl text-white">How we stack up</h2>
          </div>
          <div className="max-w-3xl w-full mx-auto border border-cyan-900/50 rounded-lg overflow-x-auto bg-black/60">
            <table className="w-full font-mono text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-cyan-900/50 bg-gray-900/60">
                  <th className="px-4 py-3 text-left text-cyan-600 text-xs uppercase tracking-wider">Feature</th>
                  <th className="px-4 py-3 text-center text-cyan-400 text-xs uppercase tracking-wider">AgentTrace</th>
                  <th className="px-4 py-3 text-center text-cyan-800 text-xs uppercase tracking-wider">LangSmith</th>
                  <th className="px-4 py-3 text-center text-cyan-800 text-xs uppercase tracking-wider">Helicone</th>
                  <th className="px-4 py-3 text-center text-cyan-800 text-xs uppercase tracking-wider">Arize Phoenix</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Full Step-Tree Tracing', at: true, ls: true, h: false, a: true },
                  { feature: 'Replay / Root-Cause Debug', at: true, ls: false, h: false, a: false },
                  { feature: 'OTel gen_ai Ingest', at: true, ls: false, h: false, a: true },
                  { feature: 'Cost Analytics', at: true, ls: true, h: true, a: true },
                  { feature: 'Self-Hosting', at: true, ls: false, h: true, a: true },
                  { feature: 'Open Source', at: true, ls: false, h: true, a: true },
                  { feature: 'Starting Price', at: 'Free', ls: '$39/seat/mo', h: '$79/mo', a: 'Free (OSS)' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-cyan-900/30 hover:bg-cyan-950/10 transition-colors">
                    <td className="px-4 py-3 text-cyan-600 text-xs">{row.feature}</td>
                    {[row.at, row.ls, row.h, row.a].map((v, j) => (
                      <td key={j} className="px-4 py-3 text-center text-xs">
                        {typeof v === 'boolean' ? (
                          v ? <Check className={`w-4 h-4 mx-auto ${j === 0 ? 'text-cyan-400' : 'text-cyan-800'}`} />
                            : <span className="text-cyan-900">—</span>
                        ) : (
                          <span className={j === 0 ? 'text-cyan-400 font-bold' : 'text-cyan-800'}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-mono text-[10px] text-cyan-900 px-4 py-3">Pricing as of Sept 2026, publicly listed rates.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-6xl px-4 pb-24">
          <div className="border border-cyan-700/50 rounded-lg bg-cyan-950/20 p-12 text-center">
            <div className="font-mono text-xs text-cyan-600 uppercase tracking-widest mb-4">$ ready to deploy</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">
              Ship AI agents with confidence
            </h2>
            <p className="font-mono text-cyan-600 max-w-xl mx-auto mb-8">
              Open-source observability for AI agents. Free forever for the core. Self-host or use our hosted version.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="font-mono text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded transition-colors">
                Start Free Trial →
              </Link>
              <button
                onClick={handleUpgrade}
                className="font-mono text-sm border border-cyan-600/50 text-cyan-500 hover:border-cyan-500 hover:text-cyan-400 px-8 py-3 rounded transition-colors"
              >
                Go Pro — $19/mo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/40 bg-black/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-700" />
            <span className="font-mono text-xs text-cyan-800">AgentTrace © 2025 — agentlogs.app</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-cyan-800">
            <Link href="/pricing" className="hover:text-cyan-600 transition-colors">Pricing</Link>
            <Link href="https://github.com/infosiva/agenttrace" target="_blank" className="hover:text-cyan-600 transition-colors">GitHub</Link>
            <Link href="/docs" className="hover:text-cyan-600 transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
