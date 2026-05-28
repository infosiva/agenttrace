import Script from 'next/script'
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import ChatBot from '@/components/ChatBot';
import { getSiteFlags } from '@/lib/flags';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const flags = await getSiteFlags('agenttrace')
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
            --theme-primary: #00e5ff;
            --theme-secondary: #39ff14;
            --theme-base: #050a0f;
            --background: #050a0f;
            --surface-1: #0a1520;
            --surface-2: #0f1e2e;
            --foreground: #e0f7fa;
            --text-2: #80deea;
            --border-default: rgba(0,229,255,0.12);
            --border-strong: rgba(0,229,255,0.25);
            /* legacy aliases for existing components */
            --bg: #050a0f;
            --surface: #0a1520;
            --border: rgba(0,229,255,0.12);
            --text: #e0f7fa;
            --accent: #39ff14;
            --accent-dim: rgba(57,255,20,0.08);
            --blue: #00e5ff;
          }
          html, body { background: #050a0f !important; color: #e0f7fa !important; font-family: var(--font-body, system-ui) !important; }
          code, pre, .mono { font-family: var(--font-mono, 'JetBrains Mono', monospace) !important; }
          .glass { background: rgba(5,10,15,0.75) !important; border-color: rgba(0,229,255,0.1) !important; }
          /* Nav upgrade */
          nav { background: rgba(5,10,15,0.92) !important; border-bottom: 1px solid rgba(0,229,255,0.12) !important; backdrop-filter: blur(20px); }
        `}} />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable}`} style={{ background: '#050a0f', color: '#e0f7fa' }}>
        <div className="aurora aurora-primary" aria-hidden />
        <div className="aurora aurora-secondary" aria-hidden />
        <div className="aurora aurora-third" aria-hidden />
        <div className="grain" aria-hidden />
        <Providers>
          <AppNav />
          {children}
          {flags.chatbot && <ChatBot />}
        </Providers>
        <Script defer data-domain="agentlogs.app" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        <Script defer data-site="agentlogs.app" src="http://31.97.56.148:3098/t.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
