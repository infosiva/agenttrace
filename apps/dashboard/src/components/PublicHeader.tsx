import Link from 'next/link'
import { Logo } from './Logo'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/40 bg-black/80 backdrop-blur">
      <nav className="container mx-auto max-w-6xl flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <Logo />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-mono">
          {['Features', 'Integrations', 'Pricing', 'Docs'].map(item => (
            <Link
              key={item}
              href={item === 'Features' ? '/#features' : `/${item.toLowerCase()}`}
              className="text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="font-mono text-sm text-slate-300 hover:text-cyan-300 transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link href="/dashboard" className="font-mono text-sm bg-cyan-500/10 border border-cyan-600/50 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>
    </header>
  )
}
