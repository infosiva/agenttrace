'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';

const ACCENT = '#22d3ee';
const ACCENT2 = '#67e8f9';

type FrameworkId = 'openai' | 'langchain' | 'raw';

interface FrameworkTab {
  id: FrameworkId;
  label: string;
  install: string;
  code: string;
  shipped: boolean;
}

const frameworks: FrameworkTab[] = [
  {
    id: 'openai',
    label: 'OpenAI SDK',
    install: 'pip install agentlogs',
    code: `from agentlogs import wrap_openai
from openai import OpenAI

client = wrap_openai(OpenAI())

# every call below is traced automatically —
# no extra lines at the call site
resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "..."}],
)`,
    shipped: true,
  },
  {
    id: 'langchain',
    label: 'LangChain',
    install: 'pip install agentlogs',
    code: `from agentlogs.integrations.langchain import AgentLogsCallback

chain.invoke(
    {"input": "..."},
    config={"callbacks": [AgentLogsCallback()]},
)
# chains, agents, tool calls, and token counts
# all show up as one trace tree`,
    shipped: true,
  },
  {
    id: 'raw',
    label: 'Raw HTTP',
    install: 'no SDK required',
    code: `curl -X POST https://api.agentlogs.app/v1/otel/traces \\
  -H "Authorization: Bearer $AGENTLOGS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"resourceSpans": [...]}'
# standard OTLP/JSON — send from any language,
# any framework, any custom agent loop`,
    shipped: true,
  },
];

const steps = [
  { n: 1, title: 'Wrap your client', body: 'One import. No manual span creation, no decorators on every function.' },
  { n: 2, title: 'Run your agent as usual', body: 'Every LLM call, tool call, and chain step is captured in the background.' },
  { n: 3, title: 'See the full trace tree', body: 'Nested spans show exactly which step failed, how long each took, and what it cost.' },
  { n: 4, title: 'Replay and fix', body: 'Re-run any step in isolation with its original input to confirm a fix before shipping.' },
];

export default function DemoPage() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<FrameworkId>('openai');
  const [tick, setTick] = useState(0);
  const active = frameworks.find(f => f.id === tab)!;

  useEffect(() => {
    setVisible(true);
    const t = setInterval(() => setTick(n => n + 1), 1400);
    return () => clearInterval(t);
  }, []);

  const traceLog = [
    { label: 'agent:planner', detail: `tool_call: search_web`, ms: 120 + (tick * 7) % 80, status: 'ok' as const },
    { label: 'agent:executor', detail: `llm_call: gpt-4o`, ms: 340 + (tick * 13) % 120, status: 'ok' as const },
    { label: 'agent:validator', detail: `tool_call: check_output`, ms: 80 + (tick * 11) % 40, status: tick % 5 === 0 ? 'error' as const : 'pending' as const },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'monospace' }}>
      <PublicHeader />
      <style>{`
        @keyframes demo-fade { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
        @keyframes demo-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        .demo-tab { transition: color 150ms cubic-bezier(.23,1,.32,1), border-color 150ms cubic-bezier(.23,1,.32,1); }
        .demo-step { transition: border-color 200ms cubic-bezier(.23,1,.32,1), transform 200ms cubic-bezier(.23,1,.32,1); }
        .demo-step:hover { transform: translateY(-3px); }
        @media (max-width: 768px) { .demo-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '64px 24px 40px', textAlign: 'center', opacity: visible ? 1 : 0, animation: visible ? 'demo-fade 0.5s ease-out' : 'none' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: 'demo-blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: '0.05em' }}>HOW IT WORKS</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 16, maxWidth: 720, marginInline: 'auto' }}>
          Wrap your agent. Get the full trace tree. Fix it in minutes.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(248,250,252,0.55)', maxWidth: 560, marginInline: 'auto', lineHeight: 1.7 }}>
          No manual instrumentation, no separate spans to write. AgentLogs hooks into your client or callback once —
          every LLM call, tool call, and step after that is captured and replayable.
        </p>
      </section>

      {/* 4-step flow */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 56px' }}>
        <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {steps.map(s => (
            <div key={s.n} className="demo-step" style={{ border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: 16, background: '#0a1628' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: `1px solid ${ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#f8fafc' }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code + live trace panel */}
      <section className="demo-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: framework tabs + snippet */}
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '1px solid rgba(248,250,252,0.1)' }}>
            {frameworks.map(f => (
              <button
                key={f.id}
                onClick={() => setTab(f.id)}
                className="demo-tab"
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === f.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                  color: tab === f.id ? ACCENT : 'rgba(248,250,252,0.5)',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ background: '#0a1628', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16 }}>
            <code style={{ display: 'block', fontSize: 11, color: ACCENT, marginBottom: 10 }}>$ {active.install}</code>
            <pre style={{ fontSize: 11.5, color: 'rgba(248,250,252,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, overflowX: 'auto' }}>{active.code}</pre>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(248,250,252,0.4)', marginTop: 10 }}>
            Don&apos;t see your framework? Check{' '}
            <Link href="/integrations" style={{ color: ACCENT }}>integrations</Link> — the raw HTTP API works with anything.
          </p>
        </div>

        {/* Right: live animated trace tree */}
        <div style={{ background: '#0a1628', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, animation: 'demo-blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: 11 }}>trace tree · live preview</span>
          </div>
          {traceLog.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', fontSize: 11.5, borderBottom: i < traceLog.length - 1 ? '1px solid rgba(248,250,252,0.06)' : 'none' }}>
              <span style={{ color: row.status === 'error' ? '#f87171' : row.status === 'ok' ? 'rgba(248,250,252,0.75)' : ACCENT2 }}>
                [{row.status === 'error' ? '✕' : row.status === 'ok' ? '✓' : '→'}] {row.label} — {row.detail}
              </span>
              <span style={{ color: 'rgba(248,250,252,0.35)', whiteSpace: 'nowrap' }}>{row.ms}ms</span>
            </div>
          ))}
          <p style={{ fontSize: 10.5, color: 'rgba(248,250,252,0.3)', marginTop: 12 }}>
            Simulated for this demo — real traces from your project appear the same way in{' '}
            <Link href="/traces" style={{ color: ACCENT }}>Traces</Link>.
          </p>
        </div>
      </section>

      {/* What you actually get — factual only, no competitor claims (no verified citations yet) */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 24, background: '#0a1628' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>What tracing gives you</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Full nested trace tree — every LLM call, tool call, and chain step in one view, not scattered logs',
              'Per-step cost and token counts, so you know which call in the pipeline is expensive',
              'Replay any step in isolation with its original input, to confirm a fix before re-running the whole agent',
              'Auto-instrumentation for OpenAI + LangChain today — zero manual span code',
            ].map(item => (
              <li key={item} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: 'rgba(248,250,252,0.7)', lineHeight: 1.6 }}>
                <Check className="h-4 w-4" style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link
            href="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#022c0a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            Start tracing your agent →
          </Link>
        </div>
      </section>
    </main>
  );
}
