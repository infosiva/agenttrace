import Script from 'next/script'
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import ChatBot from '@/components/ChatBot';
import AppNav from '@/components/AppNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://agentlogs.app'),
  title: 'AgentTrace — AI Agent Observability & Monitoring Platform',
  description: 'Trace, debug, and monitor AI agents in production. Complete observability for LLM calls, tool use, errors, and costs. Real-time agent monitoring platform.',
  keywords: ['AI agent monitoring', 'LLM observability', 'agent debugging', 'AI tracing', 'agent logs'],
  authors: [{ name: 'AgentTrace' }],
  openGraph: {
    title: 'AgentTrace — Monitor Your AI Agents',
    description: 'Complete observability for production AI agents. Debug LLM calls, optimize costs, track errors.',
    url: 'https://agentlogs.app',
    siteName: 'AgentTrace',
    type: 'website',
    images: [{
      url: 'https://agentlogs.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'AgentTrace - AI Agent Monitoring Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentTrace — Monitor Your AI Agents',
    description: 'Complete observability for production AI agents'
  },
  robots: 'index, follow'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AgentTrace",
          "description": "AI Agent Observability Platform",
          "url": "https://agentlogs.app",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Cloud",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }) }} />
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
          <AppNav />
          {children}
          <ChatBot />
        </Providers>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script src="http://31.97.56.148:3098/t.js" data-site="agentlogs.app" defer></script>
            <Script async src="http://31.97.56.148:3100/script.js" data-website-id="56dc060a-d35d-4de6-b925-c9dba0ec3542" strategy="afterInteractive" />
      </body>
    </html>
  );
}
