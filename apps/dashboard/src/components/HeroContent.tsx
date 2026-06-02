// Server component — renders static hero content for social scrapers
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroContent() {
  return (
    <section className="container mx-auto max-w-6xl px-4 pt-20 pb-12">
      {/* Liquid-glass badge — CodeNest dev tool aesthetic */}
      <div className="flex justify-center mb-8">
        <span
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
            color: 'rgba(103,232,249,0.80)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Open Source · Self-Hostable · Free
        </span>
      </div>

      <div className="text-center mb-12">
        {/* Headline — oversized mono, tight tracking */}
        <h1
          className="font-mono font-black text-5xl sm:text-6xl md:text-7xl text-white mb-6 leading-[0.95]"
          style={{ letterSpacing: '-0.03em' }}
        >
          Trace every{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)' }}
          >
            AI agent
          </span>
          <br />
          call.
        </h1>

        {/* Trust pills */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap mb-6">
          {['Every LLM call', 'Tool use + errors', 'Cost tracking', 'P95 latency'].map(p => (
            <span
              key={p}
              className="font-mono text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.18)',
                color: 'rgba(103,232,249,0.65)',
              }}
            >
              {p}
            </span>
          ))}
        </div>

        <p
          className="text-base sm:text-lg max-w-2xl mx-auto font-mono leading-relaxed"
          style={{ color: 'rgba(103,232,249,0.42)' }}
        >
          Framework-agnostic observability for production agents.<br className="hidden sm:block" />
          Traced and queryable in seconds — no SDK lock-in.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/dashboard"
            className="font-mono text-sm font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-150 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(6,182,212,0.35)',
            }}
          >
            Start free — no card needed
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://github.com/infosiva/agenttrace"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm px-7 py-3.5 rounded-xl transition-all duration-150 active:scale-[0.97]"
            style={{
              border: '1px solid rgba(6,182,212,0.22)',
              color: 'rgba(103,232,249,0.70)',
              background: 'rgba(6,182,212,0.05)',
            }}
          >
            $ git clone infosiva/agenttrace
          </Link>
        </div>
      </div>
    </section>
  );
}
