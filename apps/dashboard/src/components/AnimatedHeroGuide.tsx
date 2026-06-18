'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const ACCENT = '#22c55e'
const ACCENT2 = '#16a34a'

const features = [
  { icon: '🔍', title: 'Full Trace Visibility', desc: 'See every LLM call, tool invocation, and agent decision in a unified timeline. No more guessing.' },
  { icon: '🐛', title: 'Root Cause Debugging', desc: 'TraceBot pinpoints where your pipeline failed — wrong tool call, hallucination, timeout, or bad prompt.' },
  { icon: '📊', title: 'Latency & Cost Analytics', desc: 'Track p50/p95 latency per agent step and token cost per run. Optimise before it hurts in production.' },
  { icon: '🛡️', title: 'Production Monitoring', desc: 'Set anomaly thresholds. Get alerted when agent behaviour drifts from expected baseline.' },
]

const steps = [
  { num: '01', title: 'Instrument once', desc: 'Drop one SDK call in your agent. Traces flow automatically.' },
  { num: '02', title: 'See every step', desc: 'Full call graph: prompts, tools, decisions, outputs — timestamped.' },
  { num: '03', title: 'Debug with AI', desc: 'TraceBot reads your trace and explains exactly what went wrong.' },
  { num: '04', title: 'Monitor live', desc: 'Set baselines. Get Slack/webhook alerts when agents misbehave.' },
]

function GridBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
  )
}

function ScanLine() {
  const [pos, setPos] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPos(p => (p + 1) % 100), 30)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ position: 'absolute', top: `${pos}%`, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)', pointerEvents: 'none', transition: 'top 30ms linear' }} />
  )
}

export default function AnimatedHeroGuide() {
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setVisible(true)
    const s = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 3000)
    const t = setInterval(() => setTick(n => n + 1), 1200)
    return () => { clearInterval(s); clearInterval(t) }
  }, [])

  const fakeLogs = [
    `[${tick % 2 === 0 ? '✓' : '→'}] agent:planner — tool_call: search_web (${120 + (tick * 7) % 80}ms)`,
    `[✓] agent:executor — llm_call: claude-3-5-sonnet (${340 + (tick * 13) % 120}ms, $0.00${(tick * 3) % 9}2)`,
    `[→] agent:validator — tool_call: check_output (${80 + (tick * 11) % 40}ms)`,
    `[✓] pipeline complete — 3 steps, ${540 + (tick * 19) % 200}ms total`,
  ]

  return (
    <>
      <style>{`
        @keyframes at-fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes at-glow { 0%,100%{opacity:0.3;} 50%{opacity:0.8;} }
        @keyframes at-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes at-shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
        @keyframes at-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        .at-shimmer-text {
          background: linear-gradient(90deg, #22c55e, #4ade80, #86efac, #22c55e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: at-shimmer 4s linear infinite;
        }
        .at-card { transition: transform 200ms cubic-bezier(.23,1,.32,1), box-shadow 200ms cubic-bezier(.23,1,.32,1); }
        .at-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(34,197,94,0.12), 0 0 0 1px rgba(34,197,94,0.2); }
        @media (max-width: 640px) { .at-grid { grid-template-columns: 1fr !important; } .at-steps { flex-direction: column !important; } .at-hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; } }
      `}</style>

      <section style={{ position: 'relative', overflow: 'hidden', background: '#020617', padding: '80px 24px 60px' }}>
        <GridBg />
        <ScanLine />
        <div style={{ position: 'absolute', top: -100, right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', animation: 'at-glow 8s ease-in-out infinite', pointerEvents: 'none' }} />

        <div className="at-hero-grid" style={{ position: 'relative', maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', opacity: visible ? 1 : 0, animation: visible ? 'at-fade-up 0.6s ease-out' : 'none' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: 'at-blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: '0.05em' }}>AI OBSERVABILITY PLATFORM</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: '#f8fafc' }}>
              Debug AI agents<br />
              <span className="at-shimmer-text">before users do.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(248,250,252,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
              AgentTrace gives you full trace visibility into every LLM call, tool use, and agent decision. Know exactly why your pipeline failed — and fix it in minutes, not hours.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>View traces →</Link>
              <Link href="/traces" style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.25)', color: ACCENT, fontWeight: 600, fontSize: 14, textDecoration: 'none', background: 'rgba(34,197,94,0.05)' }}>Browse examples</Link>
            </div>
          </div>

          {/* Live trace preview */}
          <div style={{ background: '#0a1628', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '16px', fontFamily: 'monospace', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, animation: 'at-blink 1.4s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: 11 }}>agent-trace · live</span>
            </div>
            {fakeLogs.map((log, i) => (
              <div key={i} style={{ color: i === 2 ? '#fbbf24' : 'rgba(248,250,252,0.7)', marginBottom: 8, lineHeight: 1.5, fontSize: 11, transition: 'all 0.3s' }}>
                {log}
              </div>
            ))}
            <div style={{ color: ACCENT, marginTop: 4 }}>
              <span style={{ animation: 'at-blink 1s steps(2, end) infinite' }}>▋</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#020617', padding: '60px 24px', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 700, color: '#f8fafc', marginBottom: 10 }}>Full-stack agent observability</h2>
            <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 14 }}>Everything you need to understand production AI behaviour</p>
          </div>
          <div className="at-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {features.map((f, i) => (
              <div key={i} className="at-card" style={{ padding: '22px', background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 14, animation: `at-fade-up 0.5s ease-out ${i * 0.1}s both` }}>
                <div style={{ fontSize: 26, marginBottom: 10, animation: 'at-float 4s ease-in-out infinite', display: 'inline-block' }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 5 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.45)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ background: '#020a04', padding: '60px 24px 80px', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 700, color: '#f8fafc', marginBottom: 10 }}>From instrumentation to insight</h2>
          </div>
          <div className="at-steps" style={{ display: 'flex', gap: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '12%', right: '12%', height: 1, background: 'rgba(34,197,94,0.1)' }} />
            {steps.map((s, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{ flex: 1, textAlign: 'center', padding: '0 10px', cursor: 'pointer' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: activeStep === i ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})` : 'rgba(34,197,94,0.06)', border: `2px solid ${activeStep === i ? ACCENT : 'rgba(34,197,94,0.18)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', transition: 'all 300ms cubic-bezier(.23,1,.32,1)', boxShadow: activeStep === i ? '0 0 20px rgba(34,197,94,0.4)' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: activeStep === i ? '#fff' : ACCENT, letterSpacing: '0.05em' }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: activeStep === i ? ACCENT : '#f8fafc', marginBottom: 5, transition: 'color 300ms' }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(248,250,252,0.4)', lineHeight: 1.5, maxWidth: 150, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
