import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import Link from 'next/link';
import { Activity, Globe } from 'lucide-react';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'AgentTrace — AI Agent Observability',
  description: 'Trace, debug, and monitor AI agents in production',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --bg: #020617;
            --surface: #0f172a;
            --surface-2: #1e293b;
            --border: rgba(51,65,85,0.6);
            --text: #f8fafc;
            --text-2: rgba(148,163,184,0.9);
            --accent: #22c55e;
            --accent-dim: rgba(34,197,94,0.1);
            --blue: #3b82f6;
          }
          html, body { background: #020617 !important; color: #f8fafc !important; font-family: var(--font-body, system-ui) !important; }
          code, pre, .mono { font-family: var(--font-mono, monospace) !important; }
          /* Nav upgrade */
          nav { background: rgba(2,6,23,0.95) !important; border-bottom: 1px solid rgba(51,65,85,0.5) !important; backdrop-filter: blur(12px); }
        `}} />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable}`} style={{ background: '#020617', color: '#f8fafc' }}>
        <Providers>
          <nav style={{ background: 'rgba(2,6,23,0.97)', borderBottom: '1px solid rgba(51,65,85,0.5)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 24, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
              <Activity style={{ width: 16, height: 16, color: '#22c55e' }} />
              <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14, letterSpacing: '-0.02em' }}>AgentTrace</span>
              <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '1px 6px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>BETA</span>
            </div>
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/traces', label: 'Traces' },
              { href: '/sites', label: 'Monitor' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.8)')}
              >{label}</Link>
            ))}
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
