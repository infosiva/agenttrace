import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import Link from 'next/link';
import { Activity, Globe } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentTrace - AI Agent Observability',
  description: 'Trace, debug, and monitor AI agents in production',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <nav className="bg-slate-900 border-b border-slate-800 px-6 h-14 flex items-center gap-6">
            <div className="flex items-center gap-2 mr-4">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-slate-100">AgentTrace</span>
            </div>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-100 transition">Dashboard</Link>
            <Link href="/sites" className="text-sm text-slate-400 hover:text-slate-100 transition flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              Portfolio Monitor
            </Link>
            <Link href="/traces" className="text-sm text-slate-400 hover:text-slate-100 transition">Traces</Link>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
