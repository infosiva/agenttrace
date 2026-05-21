// Server component — renders static hero content for social scrapers
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroContent() {
  return (
    <section className="container mx-auto max-w-6xl px-4 pt-20 pb-12">
      {/* Trust badge */}
      <div className="flex justify-center mb-8">
        <span className="inline-flex items-center gap-2 font-mono text-xs border border-green-900/70 bg-green-950/30 text-green-500 px-3 py-1.5 rounded-full">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          Open Source
          <span className="text-green-700">·</span>
          Self-Hostable
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
          <Link href="https://github.com/infosiva/agenttrace" target="_blank" rel="noopener noreferrer" className="font-mono text-sm border border-green-800 text-green-600 hover:border-green-600 hover:text-green-400 px-6 py-3 rounded transition-colors">
            $ git clone infosiva/agenttrace
          </Link>
        </div>
      </div>
    </section>
  );
}
