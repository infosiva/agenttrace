'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, BarChart3, Clock, DollarSign, Check, Zap, Shield, Code2, TrendingUp, Terminal, AlertCircle, Radio, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const LOG_LINES = [
  { time: '14:32:01.423', level: 'INFO', agent: 'research-agent', msg: 'Starting task: "Summarize latest AI papers"', color: 'text-green-400' },
  { time: '14:32:01.891', level: 'CALL', agent: 'research-agent', msg: 'tool_call: search_arxiv(query="transformer architecture 2024")', color: 'text-cyan-400' },
  { time: '14:32:02.340', level: 'INFO', agent: 'research-agent', msg: 'Retrieved 47 papers, filtering by relevance score > 0.85', color: 'text-green-400' },
  { time: '14:32:02.891', level: 'CALL', agent: 'research-agent', msg: 'llm_call: claude-3-5-sonnet (tokens: 4,291)', color: 'text-cyan-400' },
  { time: '14:32:04.102', level: 'INFO', agent: 'research-agent', msg: 'Step completed: latency=1.2s cost=$0.0043', color: 'text-green-400' },
  { time: '14:32:04.201', level: 'WARN', agent: 'summarizer', msg: 'Rate limit approaching: 85% of quota used', color: 'text-yellow-400' },
  { time: '14:32:04.890', level: 'CALL', agent: 'summarizer', msg: 'tool_call: fetch_url(url="https://arxiv.org/abs/2401.12345")', color: 'text-cyan-400' },
  { time: '14:32:05.112', level: 'INFO', agent: 'summarizer', msg: 'Chunk 1/3 processed: 2,048 tokens compressed to 312', color: 'text-green-400' },
  { time: '14:32:05.445', level: 'INFO', agent: 'summarizer', msg: 'Chunk 2/3 processed: 1,891 tokens compressed to 287', color: 'text-green-400' },
  { time: '14:32:05.901', level: 'INFO', agent: 'summarizer', msg: 'Chunk 3/3 processed: 2,143 tokens compressed to 321', color: 'text-green-400' },
  { time: '14:32:06.003', level: 'DONE', agent: 'research-agent', msg: 'Task complete — total: 3.58s / $0.0124 / 5 steps', color: 'text-green-300' },
  { time: '14:32:06.244', level: 'INFO', agent: 'monitor', msg: 'Trace saved: trace_7f3a9b2c [id: 7f3a9b2c]', color: 'text-green-400' },
  { time: '14:32:07.001', level: 'INFO', agent: 'writer-agent', msg: 'Starting task: "Draft blog post from summary"', color: 'text-green-400' },
  { time: '14:32:07.445', level: 'CALL', agent: 'writer-agent', msg: 'llm_call: gpt-4o (tokens: 1,102)', color: 'text-cyan-400' },
  { time: '14:32:08.330', level: 'ERROR', agent: 'writer-agent', msg: 'OpenAI timeout after 1000ms — retrying with fallback', color: 'text-red-400' },
  { time: '14:32:08.891', level: 'CALL', agent: 'writer-agent', msg: 'llm_call: claude-3-haiku (fallback, tokens: 1,102)', color: 'text-cyan-400' },
  { time: '14:32:09.210', level: 'DONE', agent: 'writer-agent', msg: 'Draft complete — 847 words / latency 1.78s / $0.0031', color: 'text-green-300' },
];

const METRICS = [
  { label: 'Req/sec', value: '2,847', delta: '+12%', color: 'text-green-400' },
  { label: 'P99 Latency', value: '1.24s', delta: '-8ms', color: 'text-cyan-400' },
  { label: 'Error Rate', value: '0.3%', delta: '-0.1%', color: 'text-green-400' },
  { label: 'Cost/1k', value: '$0.041', delta: '-4%', color: 'text-cyan-400' },
];

function LogStream() {
  const [visibleLines, setVisibleLines] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= LOG_LINES.length) return 5;
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="terminal-panel rounded-lg border border-green-900/60 bg-black/90 overflow-hidden">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-green-900/40">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-green-600">agentlogs.app — live trace stream</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 live-dot" />
          <span className="font-mono text-xs text-green-500 tracking-widest">LIVE</span>
        </span>
      </div>
      {/* Log body */}
      <div
        ref={containerRef}
        className="p-4 h-72 overflow-y-auto space-y-1 font-mono text-xs scrollbar-hide"
      >
        {LOG_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-gray-600 shrink-0">{line.time}</span>
            <span className={`shrink-0 w-10 ${
              line.level === 'ERROR' ? 'text-red-400' :
              line.level === 'WARN' ? 'text-yellow-400' :
              line.level === 'CALL' ? 'text-cyan-400' :
              line.level === 'DONE' ? 'text-green-300' : 'text-green-600'
            }`}>[{line.level}]</span>
            <span className="text-purple-400 shrink-0">{line.agent}</span>
            <span className={line.color}>{line.msg}</span>
          </div>
        ))}
        <div className="flex gap-2 animate-pulse">
          <span className="text-gray-600">▋</span>
        </div>
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
        <div key={i} className="terminal-panel rounded-lg border border-green-900/50 bg-black/80 p-4">
          <div className="font-mono text-xs text-green-600 mb-1 uppercase tracking-widest">{m.label}</div>
          <div className={`font-mono text-2xl font-bold ${m.color} tabular-nums metric-glow`}>{m.value}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`font-mono text-xs ${m.delta.startsWith('-') && m.label !== 'P99 Latency' && m.label !== 'Error Rate' ? 'text-red-400' : 'text-green-500'}`}>{m.delta}</span>
            <span className="font-mono text-xs text-gray-600">24h</span>
            <span className={`ml-auto w-1.5 h-1.5 rounded-full ${tick % 2 === i % 2 ? 'bg-green-400' : 'bg-green-800'} transition-colors duration-500`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const PRO_FEATURES = [
  'Unlimited log retention (30 days)',
  'Alerting & PagerDuty integration',
  'Team access (up to 10 seats)',
  'REST API + webhook exports',
  'Priority support (4h SLA)',
  'SSO / SAML authentication',
];

const FREE_FEATURES = [
  '7-day log retention',
  '3 agents max',
  '10k events/month',
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
      {/* Pro upgrade success banner */}
      {showProBanner && (
        <div className="pro-banner fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 bg-green-500 text-black font-mono text-sm font-bold py-3 px-4">
          <Check className="w-4 h-4" />
          Welcome to AgentTrace Pro! Unlimited logs, alerting, and team access are now active.
        </div>
      )}

      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none bg-grid-green" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,255,65,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0,200,255,0.04) 0%, transparent 50%)`,
      }} />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-green-900/40 bg-black/80 backdrop-blur">
        <nav className="container mx-auto max-w-6xl flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2 mr-8">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="font-mono font-bold text-green-400 tracking-tight">AgentTrace</span>
            <span className="hidden sm:block font-mono text-xs text-green-700 border border-green-900 px-1.5 py-0.5 rounded">v2.0</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-mono">
            {['Features', 'Integrations', 'Pricing', 'Docs'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-green-700 hover:text-green-400 transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="font-mono text-sm text-green-700 hover:text-green-400 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/dashboard" className="font-mono text-sm bg-green-500/10 border border-green-600/50 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded transition-colors">
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
            <span className="inline-flex items-center gap-2 font-mono text-xs border border-green-900/70 bg-green-950/30 text-green-500 px-3 py-1.5 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              Trusted by 500+ AI developers
              <span className="text-green-700">·</span>
              Open Source
            </span>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-mono font-bold text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
              Monitor, debug, and{' '}
              <span className="text-green-400">optimize</span>
              <br />
              your AI agents{' '}
              <span className="text-cyan-400">in real-time</span>
            </h1>
            <p className="text-green-700 text-lg sm:text-xl max-w-2xl mx-auto font-mono leading-relaxed">
              Complete observability for production AI agents. Every LLM call, tool use,<br className="hidden sm:block" />
              error, and cost — traced and queryable in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/dashboard" className="font-mono text-sm bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded transition-colors flex items-center gap-2">
                Start free — no card needed
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="https://github.com/infosiva/agenttrace" target="_blank" className="font-mono text-sm border border-green-800 text-green-600 hover:border-green-600 hover:text-green-400 px-6 py-3 rounded transition-colors">
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
        <section className="container mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-12">
            <div className="font-mono text-xs text-green-600 uppercase tracking-widest mb-3">// capabilities</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">
              Everything you need to ship reliable AI
            </h2>
            <p className="text-green-700 font-mono">Built-in observability. Zero vendor lock-in. Works with any framework.</p>
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
              { icon: TrendingUp, title: 'Production Scale', desc: 'Handles 10k events/sec. Designed for enterprise workloads' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group border border-green-900/50 bg-black/60 rounded-lg p-5 hover:border-green-700/70 hover:bg-green-950/20 transition-all">
                <div className="w-8 h-8 rounded bg-green-950 border border-green-800 flex items-center justify-center mb-3 group-hover:border-green-600 transition-colors">
                  <Icon className="w-4 h-4 text-green-500" />
                </div>
                <div className="font-mono font-semibold text-green-300 text-sm mb-1">{title}</div>
                <div className="font-mono text-xs text-green-700 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick start */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center mb-10">
            <div className="font-mono text-xs text-green-600 uppercase tracking-widest mb-3">// quickstart</div>
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
              <div key={step} className="border border-green-900/50 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/80 border-b border-green-900/30">
                  <span className="font-mono text-xs text-green-700">{step}</span>
                  <span className="font-mono text-xs text-green-500">{label}</span>
                </div>
                <pre className="p-4 bg-black/90 overflow-x-auto">
                  <code className="font-mono text-xs text-green-400">{code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing / Pro */}
        <section className="container mx-auto max-w-6xl px-4 py-20" id="pricing">
          <div className="text-center mb-12">
            <div className="font-mono text-xs text-green-600 uppercase tracking-widest mb-3">// pricing</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">Simple. Developer-first.</h2>
            <p className="text-green-700 font-mono">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="border border-green-900/50 rounded-lg p-6 bg-black/60">
              <div className="font-mono text-xs text-green-700 uppercase tracking-widest mb-2">Free</div>
              <div className="font-mono text-4xl font-bold text-white mb-1">$0</div>
              <div className="font-mono text-xs text-green-700 mb-6">Forever free, open source</div>
              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 font-mono text-sm text-green-600">
                    <Check className="w-4 h-4 text-green-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block text-center font-mono text-sm border border-green-800 text-green-600 hover:border-green-600 hover:text-green-400 px-4 py-2.5 rounded transition-colors">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-green-500/50 rounded-lg p-6 bg-green-950/20 relative">
              <div className="absolute top-4 right-4 font-mono text-xs bg-green-500/20 border border-green-500/50 text-green-400 px-2 py-0.5 rounded">
                POPULAR
              </div>
              <div className="font-mono text-xs text-green-400 uppercase tracking-widest mb-2">Pro</div>
              <div className="font-mono text-4xl font-bold text-white mb-1">$15</div>
              <div className="font-mono text-xs text-green-600 mb-6">per month, billed monthly</div>
              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 font-mono text-sm text-green-400">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="text-center font-mono text-sm text-green-400 border border-green-600/50 px-4 py-2.5 rounded bg-green-950/40">
                  ✓ You are on Pro
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full font-mono text-sm bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-4 py-2.5 rounded transition-colors"
                >
                  {loading ? 'Redirecting...' : 'Upgrade to Pro — $15/mo'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="container mx-auto max-w-6xl px-4 py-12 pb-20">
          <div className="text-center mb-10">
            <div className="font-mono text-xs text-green-600 uppercase tracking-widest mb-3">// compare</div>
            <h2 className="font-mono font-bold text-3xl text-white">How we stack up</h2>
          </div>
          <div className="max-w-3xl mx-auto border border-green-900/50 rounded-lg overflow-hidden bg-black/60">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-green-900/50 bg-gray-900/60">
                  <th className="px-4 py-3 text-left text-green-600 text-xs uppercase tracking-wider">Feature</th>
                  <th className="px-4 py-3 text-center text-green-400 text-xs uppercase tracking-wider">AgentTrace</th>
                  <th className="px-4 py-3 text-center text-green-800 text-xs uppercase tracking-wider">LangSmith</th>
                  <th className="px-4 py-3 text-center text-green-800 text-xs uppercase tracking-wider">Helicone</th>
                  <th className="px-4 py-3 text-center text-green-800 text-xs uppercase tracking-wider">Arize</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Agent-Focused', at: true, ls: true, h: false, a: true },
                  { feature: 'Multi-Step Tracing', at: true, ls: true, h: false, a: true },
                  { feature: 'Cost Analytics', at: true, ls: true, h: true, a: true },
                  { feature: 'Self-Hosting', at: true, ls: false, h: false, a: false },
                  { feature: 'Open Source', at: true, ls: false, h: false, a: false },
                  { feature: 'Starting Price', at: 'Free', ls: '$39/mo', h: 'Free', a: '$500+/mo' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-green-900/30 hover:bg-green-950/10 transition-colors">
                    <td className="px-4 py-3 text-green-600 text-xs">{row.feature}</td>
                    {[row.at, row.ls, row.h, row.a].map((v, j) => (
                      <td key={j} className="px-4 py-3 text-center text-xs">
                        {typeof v === 'boolean' ? (
                          v ? <Check className={`w-4 h-4 mx-auto ${j === 0 ? 'text-green-400' : 'text-green-800'}`} />
                            : <span className="text-green-900">—</span>
                        ) : (
                          <span className={j === 0 ? 'text-green-400 font-bold' : 'text-green-800'}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-6xl px-4 pb-24">
          <div className="border border-green-700/50 rounded-lg bg-green-950/20 p-12 text-center">
            <div className="font-mono text-xs text-green-600 uppercase tracking-widest mb-4">$ ready to deploy</div>
            <h2 className="font-mono font-bold text-3xl md:text-4xl text-white mb-4">
              Ship AI agents with confidence
            </h2>
            <p className="font-mono text-green-600 max-w-xl mx-auto mb-8">
              Join 500+ AI developers who already use AgentTrace to monitor, debug, and optimize their agents in production.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="font-mono text-sm bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded transition-colors">
                Start Free Trial →
              </Link>
              <button
                onClick={handleUpgrade}
                className="font-mono text-sm border border-green-600/50 text-green-500 hover:border-green-500 hover:text-green-400 px-8 py-3 rounded transition-colors"
              >
                Go Pro — $15/mo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-900/40 bg-black/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-700" />
            <span className="font-mono text-xs text-green-800">AgentTrace © 2025 — agentlogs.app</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-green-800">
            <Link href="/pricing" className="hover:text-green-600 transition-colors">Pricing</Link>
            <Link href="https://github.com/infosiva/agenttrace" target="_blank" className="hover:text-green-600 transition-colors">GitHub</Link>
            <Link href="/docs" className="hover:text-green-600 transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
